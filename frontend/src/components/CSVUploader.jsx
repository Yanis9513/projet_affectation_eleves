import { useState, useEffect, useRef, useCallback } from 'react'
import CountryFlag from 'react-country-flag';
import { getCountryCode } from '../utils/countryFlags';
import { formatFilieres } from '../utils/formatters.jsx';
import CountrySelect from './CountrySelect';
import FiliereSelector from './FiliereSelector';
import Button from './Button'
import { Alert } from './Loading'

export default function CSVUploader({ 
  onUploadSuccess, 
  existingStudents = [],
  type = 'students', // 'students' or 'destinations'
  projectId = null
}) {
  const [previewData, setPreviewData] = useState([])
  const [deletedItems, setDeletedItems] = useState(new Set())
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualData, setManualData] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null)

  const isDestinations = type === 'destinations'

  useEffect(() => {
    if (existingStudents.length > 0 && previewData.length === 0) {
      setPreviewData(existingStudents)
    }
  }, [existingStudents])

  // Generate name from email if name is missing
  const generateNameFromEmail = (email) => {
    if (!email || !email.includes('@')) return ''
    const namePart = email.split('@')[0]
    const parts = namePart.split(/[._]/)
    const capitalizedParts = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    return capitalizedParts.join(' ')
  }

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error(`Le fichier CSV doit contenir au moins une ligne d'en-tête et une ligne de données`)
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    if (isDestinations) {
      // Validate destination columns
      const requiredCols = ['university_name', 'country']
      const missingCols = requiredCols.filter(col => !header.includes(col))
      if (missingCols.length > 0) {
        throw new Error(`Colonnes requises manquantes: ${missingCols.join(', ')}`)
      }
    } else {
      // Validate student columns
      if (!header.includes('email')) {
        throw new Error(`Colonne requise manquante: "email" - Votre CSV doit avoir une colonne email`)
      }
    }

    // Parse data rows
    const parsedData = []
    const errors = []
    const warnings = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())
      const item = {}

      header.forEach((col, index) => {
        item[col] = values[index] || ''
      })

      if (isDestinations) {
        // Validate destination data
        if (!item.university_name) {
          errors.push(`Ligne ${i + 1}: Nom d'université manquant`)
          continue
        }
        if (!item.country) {
          errors.push(`Ligne ${i + 1}: Pays manquant`)
          continue
        }
        
        // Parse numeric fields
        if (item.total_places) {
          const places = parseInt(item.total_places)
          item.total_places = isNaN(places) ? 1 : places
        } else {
          item.total_places = 1
        }
        
        if (item.min_gpa) {
          const gpa = parseFloat(item.min_gpa)
          item.min_gpa = isNaN(gpa) ? null : gpa
        }
        
        if (item.min_toeic_score) {
          const score = parseInt(item.min_toeic_score)
          item.min_toeic_score = isNaN(score) ? null : score
        }
      } else {
        // Validate student data
        if (!item.email || !item.email.includes('@')) {
          errors.push(`Ligne ${i + 1}: Email invalide "${item.email || 'vide'}"`)
          continue
        }
        
        // Validate ESIEE email format
        const emailDomain = item.email.split('@')[1]?.toLowerCase()
        if (!emailDomain || (!emailDomain.endsWith('esiee.fr') && !emailDomain.endsWith('edu.esiee.fr'))) {
          errors.push(`Ligne ${i + 1}: Email non-ESIEE "${item.email}" - Utilisez une adresse @esiee.fr ou @edu.esiee.fr`)
          continue
        }

        // Check for duplicate emails in current batch
        if (parsedData.some(s => s.email === item.email)) {
          warnings.push(`Ligne ${i + 1}: Email en double "${item.email}" - ignoré`)
          continue
        }

        // Auto-generate name from email if missing
        if (!item.name) {
          item.name = generateNameFromEmail(item.email)
          warnings.push(`Ligne ${i + 1}: Nom généré automatiquement depuis l'email`)
        }

        // Convert numeric fields
        if (item.rank) {
          const rank = parseInt(item.rank)
          item.rank = isNaN(rank) ? null : rank
        } else {
          item.rank = null
        }
        
        if (item.grade) {
          const grade = parseFloat(item.grade)
          item.grade = isNaN(grade) ? null : grade
        } else {
          item.grade = null
        }
      }

      item.id = Date.now() + i
      parsedData.push(item)
    }

    // Throw error if any critical errors
    if (errors.length > 0) {
      throw new Error(`Erreurs trouvées:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... et ${errors.length - 5} autres erreurs` : ''}`)
    }

    // Show warnings but continue
    if (warnings.length > 0) {
      console.warn('Avertissements CSV:', warnings)
    }

    if (parsedData.length === 0) {
      throw new Error(`Aucune donnée valide trouvée dans le fichier CSV`)
    }

    return parsedData
  }

  const downloadTemplate = () => {
    let template
    if (isDestinations) {
      template = `university_name,country,city,total_places,mobility_type,accepted_filieres,min_english_level,min_toeic_score,min_gpa
MIT,USA,Boston,5,ECHANGE_ACADEMIQUE,"INFORMATIQUE,ELECTRONIQUE",B2,800,14.0
Imperial College,UK,London,3,ECHANGE_ACADEMIQUE,INFORMATIQUE,C1,900,16.0`
    } else {
      template = 'email,name,filiere,rank,grade\netudiant@edu.esiee.fr,Jean Dupont,E5FI,42,14.5'
    }
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = isDestinations ? 'template_destinations.csv' : 'template_etudiants.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleEditItem = (index, field, value) => {
    const updatedData = [...previewData]
    updatedData[index][field] = value
    setPreviewData(updatedData)
    
    // Debounce the callback to avoid excessive updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (onUploadSuccess) {
        onUploadSuccess(updatedData)
      }
    }, 500) // 500ms debounce
  }
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        const parsedData = parseCSV(text)
        
        let newItems
        if (isDestinations) {
          // For destinations, just merge (no deduplication by name)
          const existingNames = new Set([...previewData.map(d => d.university_name?.toLowerCase()), ...deletedItems])
          newItems = parsedData.filter(d => !existingNames.has(d.university_name?.toLowerCase()))
        } else {
          // For students, deduplicate by email
          const existingEmails = new Set([...previewData.map(s => s.email), ...deletedItems])
          newItems = parsedData.filter(s => !existingEmails.has(s.email))
        }
        
        const duplicateCount = parsedData.length - newItems.length
        
        if (newItems.length > 0) {
          setPreviewData(prev => [...prev, ...newItems])
          setError('')
          
          if (duplicateCount > 0) {
            setError(`${newItems.length} ${isDestinations ? 'destinations' : 'étudiants'} ajoutés. ${duplicateCount} doublons ignorés.`)
          } else {
            setError(`${newItems.length} ${isDestinations ? 'destinations' : 'étudiants'} ajoutés!`)
          }
        } else if (duplicateCount > 0) {
          setError(`Tous les ${isDestinations ? 'éléments' : 'étudiants'} de ce fichier existent déjà.`)
        }
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
    
    event.target.value = ''
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target.result
          const parsedData = parseCSV(text)
          
          const mergedData = [...previewData, ...parsedData]
          setPreviewData(mergedData)
          onUploadSuccess(mergedData)
          setError('')
        } catch (err) {
          setError(err.message)
        }
      }
      reader.readAsText(file)
    } else {
      setError('Veuillez déposer un fichier CSV')
    }
  }

  const handleDeleteItem = (index) => {
    const itemToDelete = previewData[index]
    const updatedData = previewData.filter((_, i) => i !== index)
    
    const newDeletedItems = new Set(deletedItems)
    if (isDestinations) {
      newDeletedItems.add(itemToDelete.university_name?.toLowerCase())
    } else {
      newDeletedItems.add(itemToDelete.email)
    }
    setDeletedItems(newDeletedItems)
    
    setPreviewData(updatedData)
    
    const itemName = isDestinations ? itemToDelete.university_name : itemToDelete.name
    setError(`${isDestinations ? 'La destination' : 'L\'étudiant'} ${itemName} a été retiré.`)
  }

  const handleAddManualItem = () => {
    if (isDestinations) {
      if (!manualData.university_name || !manualData.country) {
        setError('Nom de l\'université et pays sont requis')
        return
      }
      
      // Check for duplicate university name
      if (previewData.some(d => d.university_name?.toLowerCase() === manualData.university_name?.toLowerCase())) {
        setError('Une université avec ce nom existe déjà')
        return
      }
      
      const newDestination = {
        id: Date.now(),
        university_name: manualData.university_name,
        country: manualData.country,
        city: manualData.city || '',
        total_places: parseInt(manualData.total_places) || 1,
        mobility_type: manualData.mobility_type || 'ECHANGE_ACADEMIQUE',
        accepted_filieres: manualData.accepted_filieres || 'ALL',
        min_english_level: manualData.min_english_level || '',
        min_toeic_score: manualData.min_toeic_score ? parseInt(manualData.min_toeic_score) : null,
        min_gpa: manualData.min_gpa ? parseFloat(manualData.min_gpa) : null
      }
      
      const updatedData = [...previewData, newDestination]
      setPreviewData(updatedData)
    } else {
      // Student validation
      if (!manualData.email || !manualData.email.includes('@')) {
        setError('Email valide requis')
        return
      }
      
      // Validate ESIEE email format
      const emailDomain = manualData.email.split('@')[1]?.toLowerCase()
      if (!emailDomain || (!emailDomain.endsWith('esiee.fr') && !emailDomain.endsWith('edu.esiee.fr'))) {
        setError('Utilisez une adresse ESIEE (@esiee.fr ou @edu.esiee.fr)')
        return
      }
      
      if (previewData.some(s => s.email === manualData.email)) {
        setError('Un étudiant avec cet email existe déjà')
        return
      }
      
      const studentName = manualData.name?.trim() || generateNameFromEmail(manualData.email)
      
      const newStudent = {
        id: Date.now(),
        name: studentName,
        email: manualData.email,
        filiere: manualData.filiere || '',
        rank: manualData.rank ? parseInt(manualData.rank) : null,
        grade: manualData.grade ? parseFloat(manualData.grade) : null
      }
      
      const updatedData = [...previewData, newStudent]
      setPreviewData(updatedData)
    }
    
    // Reset form
    setManualData({})
    setShowManualForm(false)
    setError('')
  }

  const renderManualForm = () => {
    if (isDestinations) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom de l'université <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={manualData.university_name || ''}
              onChange={(e) => setManualData({...manualData, university_name: e.target.value})}
              placeholder="Ex: MIT"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <CountrySelect
              value={manualData.country || ''}
              onChange={e => setManualData({...manualData, country: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              value={manualData.city || ''}
              onChange={(e) => setManualData({...manualData, city: e.target.value})}
              placeholder="Ex: Boston"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Places disponibles
            </label>
            <input
              type="number"
              value={manualData.total_places || ''}
              onChange={(e) => setManualData({...manualData, total_places: e.target.value})}
              placeholder="Ex: 5"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type de mobilité
            </label>
            <select
              value={manualData.mobility_type || 'ECHANGE_ACADEMIQUE'}
              onChange={(e) => setManualData({...manualData, mobility_type: e.target.value})}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ECHANGE_ACADEMIQUE">Échange Académique</option>
              <option value="STAGE_INTERNATIONAL">Stage International</option>
              <option value="DOUBLE_DIPLOME">Double Diplôme</option>
              <option value="SEMESTRE_RECHERCHE">Semestre Recherche</option>
            </select>
          </div>
          
          <FiliereSelector
            value={manualData.accepted_filieres || ''}
            onChange={(e) => setManualData({...manualData, accepted_filieres: e.target.value})}
            name="accepted_filieres"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Niveau d'anglais min.
            </label>
            <select
              value={manualData.min_english_level || ''}
              onChange={(e) => setManualData({...manualData, min_english_level: e.target.value})}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Aucun</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Score TOEIC min.
            </label>
            <input
              type="number"
              value={manualData.min_toeic_score || ''}
              onChange={(e) => setManualData({...manualData, min_toeic_score: e.target.value})}
              placeholder="Ex: 800"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              GPA minimum
            </label>
            <input
              type="number"
              step="0.1"
              value={manualData.min_gpa || ''}
              onChange={(e) => setManualData({...manualData, min_gpa: e.target.value})}
              placeholder="Ex: 14.0"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      )
    } else {
      // Student form (original)
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={manualData.email || ''}
              onChange={(e) => setManualData({...manualData, email: e.target.value})}
              placeholder="etudiant@edu.esiee.fr"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-xs text-slate-500 mt-1">Le nom sera généré automatiquement si non fourni</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom complet (optionnel)
            </label>
            <input
              type="text"
              value={manualData.name || ''}
              onChange={(e) => setManualData({...manualData, name: e.target.value})}
              placeholder="Jean Dupont"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Filière (optionnel)
            </label>
            <input
              type="text"
              value={manualData.filiere || ''}
              onChange={(e) => setManualData({...manualData, filiere: e.target.value})}
              placeholder="Ex: E5FI"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rang (optionnel)
            </label>
            <input
              type="number"
              value={manualData.rank || ''}
              onChange={(e) => setManualData({...manualData, rank: e.target.value})}
              placeholder="Ex: 42"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Note moyenne (optionnel)
            </label>
            <input
              type="number"
              step="0.1"
              value={manualData.grade || ''}
              onChange={(e) => setManualData({...manualData, grade: e.target.value})}
              placeholder="Ex: 14.5"
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      )
    }
  }

  const renderTable = () => {
    if (isDestinations) {
      return (
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Université</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Pays</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ville</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Places</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Filères</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {previewData.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{item.university_name}</td>
                <td className="px-4 py-3">
                  {item.country && (
                    <span className="flex items-center gap-2">
                      {getCountryCode(item.country) && (
                        <CountryFlag 
                          countryCode={getCountryCode(item.country)} 
                          svg 
                          style={{ 
                            width: '1.5em', 
                            height: '1.1em',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '2px'
                          }} 
                        />
                      )}
                      <span className="truncate" title={item.country}>{item.country}</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{item.city}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={item.total_places}
                    onChange={(e) => handleEditItem(index, 'total_places', parseInt(e.target.value) || 1)}
                    className="border rounded px-2 py-1 w-16 text-sm"
                  />
                </td>
                <td className="px-4 py-3">{item.mobility_type}</td>
                <td className="px-4 py-3 text-sm">{formatFilieres(item.accepted_filieres)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    } else {
      // Student table (original)
      return (
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Filière</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rang</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Note</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {existingStudents.length > 0 && (
              <tr className="bg-slate-50">
                <td colSpan="6" className="px-6 py-2 text-sm font-medium text-slate-700">
                  {existingStudents.length} étudiant(s) déjà inscrit(s) • {previewData.length} en attente d'import
                </td>
              </tr>
            )}
            {previewData.map((student, index) => (
              <tr key={student.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleEditItem(index, 'name', e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      onBlur={() => setEditingIndex(null)}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingIndex(index)}
                    >
                      {student.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{student.email}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={student.filiere || ''}
                    onChange={(e) => handleEditItem(index, 'filiere', e.target.value)}
                    placeholder="Ex: E5FI"
                    className="border rounded px-2 py-1 w-20 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={student.rank || ''}
                    onChange={(e) => handleEditItem(index, 'rank', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Ex: 42"
                    className="border rounded px-2 py-1 w-20 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    step="0.1"
                    value={student.grade || ''}
                    onChange={(e) => handleEditItem(index, 'grade', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Ex: 14.5"
                    className="border rounded px-2 py-1 w-20 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* CSV Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-slate-400">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Glissez-déposez votre fichier CSV ici
            </p>
            <p className="text-sm text-slate-500 mb-4">
              ou cliquez pour sélectionner un fichier • Vous pouvez ajouter plusieurs CSV
            </p>
          </div>
          
          <div className="flex justify-center gap-3 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                Sélectionner un fichier CSV
              </span>
            </label>
            
            <Button variant="secondary" onClick={() => setShowManualForm(!showManualForm)}>
              Ajouter manuellement
            </Button>
            
            <Button variant="outline" onClick={downloadTemplate}>
              Télécharger le modèle
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {showManualForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              Ajouter {isDestinations ? 'une destination' : 'un étudiant'}
            </h3>
            <button 
              onClick={() => setShowManualForm(false)}
              className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {renderManualForm()}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowManualForm(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleAddManualItem}>
              Ajouter
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h3 className="text-lg font-bold">
              {isDestinations ? 'Destinations' : 'Étudiants'} Importés ({previewData.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
        </div>
      )}

      {previewData.length > 0 && onUploadSuccess && (
        <div className="mt-6">
          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Importation en cours... {type === 'students' ? '(envoi des emails aux étudiants)' : ''}
                </span>
                <span className="text-sm text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              onClick={async () => {
                try {
                  setIsUploading(true)
                  setUploadProgress(10)
                  
                  // Simulate progress for better UX
                  const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 5, 90))
                  }, 200)
                  
                  await onUploadSuccess(previewData)
                  
                  clearInterval(progressInterval)
                  setUploadProgress(100)
                  
                  setTimeout(() => {
                    setPreviewData([])
                    setError('')
                    setIsUploading(false)
                    setUploadProgress(0)
                  }, 500)
                } catch (err) {
                  setError(`Erreur lors de l'importation`)
                  console.error('Erreur:', err)
                  setIsUploading(false)
                  setUploadProgress(0)
                }
              }}
              disabled={isUploading}
              className="px-6 py-2 text-lg"
            >
              {isUploading ? 'Importation en cours...' : 'Terminer l\'importation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
