import pandas as pd
import random
import numpy as np
from deap import base, creator, tools, algorithms

# ==========================
#     CHARGEMENT DONNÉES
# ==========================
print("Chargement des données...")
destinations = pd.read_csv("destinations.csv")
etudiants = pd.read_csv("etudiants.csv")

# Capacité restante
destinations["PLACES_RESTANTES"] = destinations["NOMBRE_PLACES"].astype(int)

# ==========================
#     TRI DES ÉTUDIANTS
# ==========================
# 1. Classement C1>C2>C3
classement_order = {"C1": 1, "C2": 2, "C3": 3}
etudiants["PRIORITE"] = etudiants["CLASSEMENT"].map(classement_order)
# 2. Trier par TOEIC décroissant
etudiants = etudiants.sort_values(by=["PRIORITE", "SCORE_TOEIC"], ascending=[True, False]).reset_index(drop=True)

print(f"Destinations: {len(destinations)}, Étudiants: {len(etudiants)}")

# ==========================
#     CONFIGURATION DEAP
# ==========================
# Créer les types DEAP
creator.create("FitnessMulti", base.Fitness, weights=(1.0, -1.0))  # satisfaction, pénalités
creator.create("Individual", list, fitness=creator.FitnessMulti)

toolbox = base.Toolbox()

# --------------------------
#  Génération d'individu
# --------------------------
def generer_affectation_valide():
    affectation = []
    capacites = destinations.set_index("UNIVERSITE")["PLACES_RESTANTES"].to_dict()
    
    for _, etu in etudiants.iterrows():
        trouve = False
        
        # Essayer chaque choix dans l'ordre
        for i in range(1, 7):
            choix_col = f"CHOIX{i}"
            if choix_col in etu and pd.notna(etu[choix_col]):
                choix = etu[choix_col]
                
                # Vérifier si la destination existe
                if choix in destinations["UNIVERSITE"].values:
                    dest = destinations[destinations["UNIVERSITE"] == choix].iloc[0]
                    
                    # Vérifier compatibilité et places
                    if (etu["TYPE_MOBILITE"] == dest["TYPE_MOBILITE"] and 
                        etu["FILIERE"] in dest["FILIERES"] and 
                        capacites.get(choix, 0) > 0):
                        
                        affectation.append(choix)
                        capacites[choix] -= 1
                        trouve = True
                        break
        
        # Si aucun choix valide
        if not trouve:
            affectation.append(None)
    
    return affectation

# Enregistrer les fonctions
toolbox.register("individual", tools.initIterate, creator.Individual, generer_affectation_valide)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)

# ==========================
#     ÉVALUATION FITNESS
# ==========================
def trouver_rang_choix(etu, universite):
    if universite is None or pd.isna(universite):
        return None
    for i in range(1, 7):
        choix_col = f"CHOIX{i}"
        if choix_col in etu and etu[choix_col] == universite:
            return i
    return None

def evaluer_solution(individu):
    satisfaction_totale = 0
    penalites = 0
    capacites_restantes = destinations.set_index("UNIVERSITE")["PLACES_RESTANTES"].to_dict()
    
    for i, (_, etu) in enumerate(etudiants.iterrows()):
        universite = individu[i]
        
        # Cas: non affecté
        if universite is None or pd.isna(universite):
            penalites += 10
            continue
        
        # Vérifier si l'université existe
        if universite not in destinations["UNIVERSITE"].values:
            penalites += 10
            continue
            
        dest = destinations[destinations["UNIVERSITE"] == universite].iloc[0]
        
        # Vérifier compatibilités
        if etu["TYPE_MOBILITE"] != dest["TYPE_MOBILITE"]:
            penalites += 5
        if etu["FILIERE"] not in dest["FILIERES"]:
            penalites += 5
        
        # Vérifier capacité
        if capacites_restantes[universite] <= 0:
            penalites += 10
        else:
            capacites_restantes[universite] -= 1
        
        # Calcul satisfaction
        rang = trouver_rang_choix(etu, universite)
        if rang:
            satisfaction_totale += (6 - rang)  # CHOIX1=5, CHOIX6=0
    
    satisfaction_moyenne = satisfaction_totale / len(etudiants)
    return satisfaction_moyenne, penalites

toolbox.register("evaluate", evaluer_solution)
toolbox.register("mate", tools.cxTwoPoint)

def muter_individu(individu, indpb=0.2):
    for i in range(len(individu)):
        if random.random() < indpb:
            etu = etudiants.iloc[i]
            
            # Chercher destinations compatibles
            compatibles = destinations[
                (destinations["TYPE_MOBILITE"] == etu["TYPE_MOBILITE"]) &
                (destinations["FILIERES"].str.contains(etu["FILIERE"]))
            ]
            
            if not compatibles.empty:
                # Choisir une destination au hasard
                individu[i] = random.choice(compatibles["UNIVERSITE"].tolist())
    
    return individu,

toolbox.register("mutate", muter_individu)
toolbox.register("select", tools.selNSGA2)

# ==========================
#     OPTIMISATION DEAP
# ==========================
def executer_optimisation():
    print("Début de l'optimisation...")
    
    population = toolbox.population(n=40)
    
    # Évaluer chaque individu
    fitnesses = list(map(toolbox.evaluate, population))
    for ind, fit in zip(population, fitnesses):
        ind.fitness.values = fit
    
    # Algorithme génétique
    population, logbook = algorithms.eaMuPlusLambda(
        population, toolbox, 
        mu=40, lambda_=80, 
        cxpb=0.6, mutpb=0.3, 
        ngen=30,  # Réduit pour rapidité
        verbose=False
    )
    
    # Meilleure solution
    best = tools.selBest(population, 1)[0]
    print(f"Optimisation terminée. Score: {best.fitness.values}")
    
    return best

# ==========================
#   EXÉCUTION PRINCIPALE
# ==========================
print("\n" + "="*50)
print("DÉMARRAGE DE L'AFFECTATION DES ÉTUDIANTS")
print("="*50)

# Exécuter l'optimisation
best_solution = executer_optimisation()

# ==========================
#   POST-TRAITEMENT FINAL
# ==========================
print("\nGénération des résultats...")

# Réduction des places
places_restantes = destinations.set_index("UNIVERSITE")["PLACES_RESTANTES"].to_dict()
resultats = []

for i, (_, etu) in enumerate(etudiants.iterrows()):
    universite = best_solution[i]
    rang = trouver_rang_choix(etu, universite)
    
    if universite and universite in places_restantes and places_restantes[universite] > 0:
        places_restantes[universite] -= 1
        score = (6 - rang) if rang else 0
        resultats.append({
            "ID_ETUDIANT": etu["ID_ETUDIANT"],
            "CLASSEMENT": etu["CLASSEMENT"],
            "SCORE_TOEIC": etu["SCORE_TOEIC"],
            "TYPE_MOBILITE": etu["TYPE_MOBILITE"],
            "FILIERE": etu["FILIERE"],
            "UNIVERSITE_AFFECTEE": universite,
            "CHOIX_OBTENU": rang if rang else "Hors choix",
            "SCORE_SATISFACTION": score
        })
    else:
        resultats.append({
            "ID_ETUDIANT": etu["ID_ETUDIANT"],
            "CLASSEMENT": etu["CLASSEMENT"],
            "SCORE_TOEIC": etu["SCORE_TOEIC"],
            "TYPE_MOBILITE": etu["TYPE_MOBILITE"],
            "FILIERE": etu["FILIERE"],
            "UNIVERSITE_AFFECTEE": None,
            "CHOIX_OBTENU": None,
            "SCORE_SATISFACTION": 0
        })

df_resultats = pd.DataFrame(resultats)

# Statistiques
total = len(df_resultats)
affectes = df_resultats["UNIVERSITE_AFFECTEE"].notna().sum()
choix1 = (df_resultats["CHOIX_OBTENU"] == 1).sum()
satisfaction = df_resultats["SCORE_SATISFACTION"].mean()

print(f"\n=== STATISTIQUES ===")
print(f"Étudiants totaux: {total}")
print(f"Affectés: {affectes} ({affectes/total*100:.1f}%)")
print(f"Avec CHOIX1: {choix1} ({choix1/total*100:.1f}%)")
print(f"Satisfaction moyenne: {satisfaction:.2f}/5")

# Étudiants sans affectation
etudiants_sans_choix = df_resultats[df_resultats["UNIVERSITE_AFFECTEE"].isna()].copy()

# Mise à jour des places
for univ in destinations["UNIVERSITE"]:
    destinations.loc[destinations["UNIVERSITE"] == univ, "PLACES_RESTANTES"] = places_restantes.get(univ, 0)

# ==========================
#     SAUVEGARDE CSV
# ==========================
print("\nSauvegarde des fichiers...")

df_resultats.to_csv("resultats_affectation.csv", index=False)
etudiants_sans_choix.to_csv("etudiants_sans_choix.csv", index=False)
destinations.to_csv("destinations_restantes.csv", index=False)

print("✓ resultats_affectation.csv")
print("✓ etudiants_sans_choix.csv")  
print("✓ destinations_restantes.csv")

# Afficher un aperçu
print("\n=== APERÇU DES RÉSULTATS ===")
print(df_resultats[["ID_ETUDIANT", "CLASSEMENT", "UNIVERSITE_AFFECTEE", "CHOIX_OBTENU"]].head(10))

print("\n" + "="*50)
print("AFFECTATION TERMINÉE AVEC SUCCÈS")
print("="*50)