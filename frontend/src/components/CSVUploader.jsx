import { useState, useEffect } from 'react'
import Button from './Button'
import { Alert } from './Loading'

export default function CSVUploader({ onUploadSuccess, existingStudents = [] }) {
  const [previewStudents, setPreviewStudents] = useState([])
  const [deletedEmails, setDeletedEmails] = useState(new Set())
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualStudent, setManualStudent] = useState({
    name: '',
    email: '',
    filiere: '',
    rank: '',
    grade: ''
  })

  useEffect(() => {
    if (existingStudents.length > 0 && previewStudents.length === 0) {
      setPreviewStudents(existingStudents)
    }
  }, [existingStudents])

  // Generate name from email if name is missing
  const generateNameFromEmail = (email) => {
    if (!email || !email.includes('@')) return ''
    
    // Extract name part before @
    const namePart = email.split('@')[0]
    
    // Split by dots or underscores
    const parts = namePart.split(/[._]/)
    
    // Capitalize each part
    const capitalizedParts = parts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    
    return capitalizedParts.join(' ')
  }

  const parseCSV = (text) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error(' Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données')
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    // Validate required column (only email is mandatory now)
    if (!header.includes('email')) {
      throw new Error(' Colonne requise manquante: "email" - Votre CSV doit avoir une colonne email')
    }

    // Parse data rows
    const parsedStudents = []
    const errors = []
    const warnings = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map(v => v.trim())
      const student = {}

      header.forEach((col, index) => {
        student[col] = values[index] || ''
      })

      // Validate email format
      if (!student.email || !student.email.includes('@')) {
        errors.push(`Ligne ${i + 1}: Email invalide "${student.email || 'vide'}"`);
        continue;
      }

      // Check for duplicate emails in current batch
      if (parsedStudents.some(s => s.email === student.email)) {
        warnings.push(`Ligne ${i + 1}: Email en double "${student.email}" - ignoré`);
        continue;
      }

      // Auto-generate name from email if missing
      if (!student.name) {
        student.name = generateNameFromEmail(student.email)
        warnings.push(`Ligne ${i + 1}: Nom généré automatiquement depuis l'email`);
      }

      // Convert numeric fields with validation
      student.id = Date.now() + i
      
      if (student.rank) {
        const rank = parseInt(student.rank)
        student.rank = isNaN(rank) ? null : rank
        if (isNaN(rank)) warnings.push(`Ligne ${i + 1}: Rang invalide "${student.rank}"`);
      } else {
        student.rank = null
      }
      
      if (student.grade) {
        const grade = parseFloat(student.grade)
        student.grade = isNaN(grade) ? null : grade
        if (isNaN(grade)) warnings.push(`Ligne ${i + 1}: Note invalide "${student.grade}"`);
      } else {
        student.grade = null
      }

      parsedStudents.push(student)
    }

    // Throw error if any critical errors
    if (errors.length > 0) {
      throw new Error(` Erreurs trouvées:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... et ${errors.length - 5} autres erreurs` : ''}`)
    }

    // Show warnings but continue
    if (warnings.length > 0) {
      console.warn('Avertissements CSV:', warnings);
    }

    if (parsedStudents.length === 0) {
      throw new Error(' Aucun étudiant valide trouvé dans le fichier CSV')
    }

    return parsedStudents
  }

  const downloadTemplate = () => {
    const template = 'email,name,filiere,rank,grade\netudiant@edu.esiee.fr,Jean Dupont,E5FI,42,14.5'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_etudiants.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleEditStudent = (index, field, value) => {
    const updatedStudents = [...previewStudents]
    updatedStudents[index][field] = value
    setPreviewStudents(updatedStudents)
    if (onUploadSuccess) {
      onUploadSuccess(updatedStudents)
    }
  }

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
        const parsedStudents = parseCSV(text)
        
        const existingEmails = new Set([...existingStudents.map(s => s.email), ...deletedEmails])
        const newStudents = parsedStudents.filter(s => !existingEmails.has(s.email))
        const duplicateCount = parsedStudents.length - newStudents.length
        
        if (newStudents.length > 0) {
          setPreviewStudents(prev => [...prev, ...newStudents])
          
          setError('')
          
          if (duplicateCount > 0) {
            setError(` ${newStudents.length} étudiants ajoutés à la prévisualisation. ${duplicateCount} doublons ignorés.`)
          } else {
            setError(` ${newStudents.length} étudiants ajoutés à la prévisualisation!`)
          }
        } else if (duplicateCount > 0) {
          setError('Tous les étudiants de ce fichier existent déjà dans la liste.')
        }
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
    
    // Reset file input to allow re-uploading same file
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
          const parsedStudents = parseCSV(text)
          
          const mergedStudents = [...previewStudents, ...parsedStudents]
          setPreviewStudents(mergedStudents)
          onUploadSuccess(mergedStudents)
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
  const handleDeleteStudent = async (index) => {
    const studentToDelete = previewStudents[index]
    const updatedStudents = previewStudents.filter((_, i) => i !== index)
    
    const newDeletedEmails = new Set([...deletedEmails, studentToDelete.email])
    setDeletedEmails(newDeletedEmails)
    
    setPreviewStudents(updatedStudents)
    
    setError(`L'étudiant ${studentToDelete.name} a été retiré de la prévisualisation.`)
    

  }
  

  const handleAddManualStudent = () => {
    if (!manualStudent.email || !manualStudent.email.includes('@')) {
      setError('Email valide requis')
      return
    }
    
    if (!manualStudent.email.endsWith('@edu.esiee.fr')) {
      setError('Veuillez utiliser une adresse email @edu.esiee.fr')
      return
    }

    // Check for duplicate email
    if (previewStudents.some(s => s.email === manualStudent.email)) {
      setError('Un étudiant avec cet email existe déjà')
      return
    }

    // Auto-generate name from email if not provided
    const studentName = manualStudent.name.trim() || generateNameFromEmail(manualStudent.email)

    const newStudent = {
      id: Date.now(),
      name: studentName,
      email: manualStudent.email,
      filiere: manualStudent.filiere || '',
      rank: manualStudent.rank ? parseInt(manualStudent.rank) : null,
      grade: manualStudent.grade ? parseFloat(manualStudent.grade) : null
    }

    const updatedStudents = [...previewStudents, newStudent]
    setPreviewStudents(updatedStudents)
    
    // Reset form
    setManualStudent({ name: '', email: '', filiere: '', rank: '', grade: '' })
    setShowManualForm(false)
    setError('')
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
          ${dragActive ? 'border-esiee-blue bg-blue-50' : 'border-gray-300 bg-white'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Glissez-déposez votre fichier CSV ici
            </p>
            <p className="text-sm text-gray-500 mb-4">
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
              <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-esiee-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-esiee-blue">
                📁 Sélectionner un fichier CSV
              </span>
            </label>
            
            <Button variant="secondary" onClick={() => setShowManualForm(!showManualForm)}>
              ➕ Ajouter manuellement
            </Button>
            
            <Button variant="outline" onClick={downloadTemplate}>
              ⬇️ Télécharger le modèle
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Add Form */}
      {showManualForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Ajouter un étudiant</h3>
            <button 
              onClick={() => setShowManualForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={manualStudent.email}
                onChange={(e) => setManualStudent({...manualStudent, email: e.target.value})}
                placeholder="etudiant@edu.esiee.fr"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
              />
              <p className="text-xs text-gray-500 mt-1">Le nom sera généré automatiquement si non fourni</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet (optionnel)
              </label>
              <input
                type="text"
                value={manualStudent.name}
                onChange={(e) => setManualStudent({...manualStudent, name: e.target.value})}
                placeholder="Jean Dupont"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filière (optionnel)
              </label>
              <input
                type="text"
                value={manualStudent.filiere}
                onChange={(e) => setManualStudent({...manualStudent, filiere: e.target.value})}
                placeholder="Ex: E5FI"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rang (optionnel)
              </label>
              <input
                type="number"
                value={manualStudent.rank}
                onChange={(e) => setManualStudent({...manualStudent, rank: e.target.value})}
                placeholder="Ex: 42"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note moyenne (optionnel)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualStudent.grade}
                onChange={(e) => setManualStudent({...manualStudent, grade: e.target.value})}
                placeholder="Ex: 14.5"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-esiee-blue"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowManualForm(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleAddManualStudent}>
              ➕ Ajouter l'étudiant
            </Button>
          </div>
        </div>
      )}

      {/* Students Table */}
      {(previewStudents.length > 0 || existingStudents.length > 0) && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-esiee-blue text-white">
            <h3 className="text-lg font-bold">
              Étudiants Importés ({previewStudents.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Filière</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rang</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {existingStudents.length > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-6 py-2 text-sm font-medium text-gray-700">
                      {existingStudents.length} étudiant(s) déjà inscrit(s) • {previewStudents.length} en attente d'import
                    </td>
                  </tr>
                )}
              
              {previewStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={student.name}
                          onChange={(e) => handleEditStudent(index, 'name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                          onBlur={() => setEditingIndex(null)}
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-esiee-blue"
                          onClick={() => setEditingIndex(index)}
                        >
                          {student.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.filiere || ''}
                        onChange={(e) => handleEditStudent(index, 'filiere', e.target.value)}
                        placeholder="Ex: E5FI"
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={student.rank || ''}
                        onChange={(e) => handleEditStudent(index, 'rank', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="Ex: 42"
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.1"
                        value={student.grade || ''}
                        onChange={(e) => handleEditStudent(index, 'grade', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Ex: 14.5"
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteStudent(index)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-3"
                      >
                        Retirer de l'import
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewStudents.length > 0 && onUploadSuccess && (
        <div className="mt-6 flex justify-end">
          <Button 
            variant="primary" 
            onClick={async () => {
              try {
                const existingEmails = new Set(existingStudents.map(s => s.email));
                const newStudents = previewStudents.filter(s => !existingEmails.has(s.email));
                
                if (newStudents.length > 0) {
                  await onUploadSuccess(newStudents);
                  setPreviewStudents([]);
                } else {
                  setError('Aucun nouvel étudiant à importer.');
                  return;
                }
                setError('');
              } catch (err) {
                setError('Erreur lors de l\'importation des étudiants');
                console.error('Erreur lors de l\'importation:', err);
              }
            }}
            className="px-6 py-2 text-lg"
          >
            Terminer l'importation
          </Button>
        </div>
      )}
    </div>
  )
}
