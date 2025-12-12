"""
Group Formation Algorithm for Group Projects

This algorithm assigns students to groups based on:
1. Partner preferences (mutual matching prioritized)
2. Group size constraints
3. Random assignment for unmatched students
"""

from typing import List, Dict, Set, Tuple, Optional
from datetime import datetime
import random
from collections import defaultdict


class GroupFormationAlgorithm:
    """
    Algorithm to form groups for group projects
    """
    
    def __init__(self, group_size: int = 3):
        self.group_size = group_size
        self.groups: List[Set[int]] = []
        self.assigned_students: Set[int] = set()
        self.preferences: Dict[int, Optional[int]] = {}
        
    def form_groups(
        self, 
        student_ids: List[int], 
        preferences: Dict[int, Optional[int]]
    ) -> List[List[int]]:
        """
        Main algorithm to form groups
        
        Args:
            student_ids: List of all student IDs to assign
            preferences: Dict mapping student_id -> preferred_partner_id (or None)
            
        Returns:
            List of groups, where each group is a list of student IDs
        """
        self.preferences = preferences
        self.groups = []
        self.assigned_students = set()
        
        # Step 1: Find mutual preferences and create pairs
        mutual_pairs = self._find_mutual_preferences(student_ids)
        
        # Step 2: Create groups from mutual pairs
        for pair in mutual_pairs:
            self._create_group_from_pair(pair, student_ids)
        
        # Step 3: Handle one-sided preferences
        self._handle_onesided_preferences(student_ids)
        
        # Step 4: Assign remaining students randomly
        self._assign_remaining_students(student_ids)
        
        # Step 5: Balance group sizes
        self._balance_groups()
        
        # Convert sets to sorted lists for consistent output
        return [sorted(list(group)) for group in self.groups]
    
    def _find_mutual_preferences(self, student_ids: List[int]) -> List[Tuple[int, int]]:
        """
        Find pairs of students who mutually selected each other
        
        Returns:
            List of tuples (student1_id, student2_id)
        """
        mutual_pairs = []
        checked = set()
        
        for student_id in student_ids:
            if student_id in checked:
                continue
                
            preferred = self.preferences.get(student_id)
            if not preferred or preferred not in student_ids:
                continue
            
            # Check if preference is mutual
            reverse_pref = self.preferences.get(preferred)
            if reverse_pref == student_id:
                mutual_pairs.append((student_id, preferred))
                checked.add(student_id)
                checked.add(preferred)
        
        return mutual_pairs
    
    def _create_group_from_pair(self, pair: Tuple[int, int], student_ids: List[int]):
        """
        Create a group starting from a mutual pair
        Fill remaining slots with available students
        """
        group = set(pair)
        self.assigned_students.update(pair)
        
        # Fill remaining slots (group_size - 2)
        available = [s for s in student_ids 
                    if s not in self.assigned_students]
        
        needed = self.group_size - len(group)
        if available and needed > 0:
            additions = random.sample(available, min(needed, len(available)))
            group.update(additions)
            self.assigned_students.update(additions)
        
        self.groups.append(group)
    
    def _handle_onesided_preferences(self, student_ids: List[int]):
        """
        Handle students who have preferences but weren't matched mutually
        Try to honor their preference by adding them to their preferred partner's group
        """
        unassigned = [s for s in student_ids if s not in self.assigned_students]
        
        for student_id in unassigned[:]:  # Copy list to modify during iteration
            preferred = self.preferences.get(student_id)
            
            if not preferred or preferred not in self.assigned_students:
                continue
            
            # Find the group containing the preferred partner
            for group in self.groups:
                if preferred in group and len(group) < self.group_size:
                    group.add(student_id)
                    self.assigned_students.add(student_id)
                    break
    
    def _assign_remaining_students(self, student_ids: List[int]):
        """
        Assign all remaining unassigned students
        """
        unassigned = [s for s in student_ids if s not in self.assigned_students]
        random.shuffle(unassigned)
        
        for student_id in unassigned:
            # Try to add to existing incomplete group
            added = False
            for group in self.groups:
                if len(group) < self.group_size:
                    group.add(student_id)
                    self.assigned_students.add(student_id)
                    added = True
                    break
            
            # If no incomplete group, create new group
            if not added:
                new_group = {student_id}
                self.assigned_students.add(student_id)
                self.groups.append(new_group)
    
    def _balance_groups(self):
        """
        Balance group sizes - move students from oversized groups to undersized ones
        """
        if not self.groups:
            return
        
        # Find groups that are too small or too large
        small_groups = [g for g in self.groups if len(g) < self.group_size - 1]
        large_groups = [g for g in self.groups if len(g) > self.group_size]
        
        # Move students from large to small groups
        for large_group in large_groups:
            while len(large_group) > self.group_size and small_groups:
                # Get smallest group
                small_group = min(small_groups, key=len)
                
                # Move a random student from large to small
                student_to_move = random.choice(list(large_group))
                large_group.remove(student_to_move)
                small_group.add(student_to_move)
                
                # Update small_groups list if group is now full
                if len(small_group) >= self.group_size - 1:
                    small_groups.remove(small_group)
        
        # Merge very small groups if necessary
        self._merge_small_groups()
    
    def _merge_small_groups(self):
        """
        Merge groups that are too small (size 1) with other groups
        """
        tiny_groups = [g for g in self.groups if len(g) == 1]
        
        for tiny_group in tiny_groups:
            # Find smallest non-tiny group to merge with
            other_groups = [g for g in self.groups 
                           if g != tiny_group and len(g) < self.group_size]
            
            if other_groups:
                target_group = min(other_groups, key=len)
                target_group.update(tiny_group)
                self.groups.remove(tiny_group)
            elif len(self.groups) > 1:
                # If no undersized groups, merge with smallest group
                target_group = min([g for g in self.groups if g != tiny_group], key=len)
                target_group.update(tiny_group)
                self.groups.remove(tiny_group)
    
    def calculate_satisfaction_score(self, groups: List[List[int]]) -> Dict[str, any]:
        """
        Calculate metrics about how well preferences were satisfied
        
        Returns:
            Dict with satisfaction statistics
        """
        total_students = sum(len(group) for group in groups)
        satisfied_count = 0
        mutual_matched = 0
        
        for group in groups:
            for student_id in group:
                preferred = self.preferences.get(student_id)
                
                # Student is satisfied if their preference is in their group
                if preferred and preferred in group:
                    satisfied_count += 1
                    
                    # Check if mutual
                    reverse_pref = self.preferences.get(preferred)
                    if reverse_pref == student_id:
                        mutual_matched += 1
        
        # Divide by 2 since mutual matches are counted twice
        mutual_matched = mutual_matched // 2
        
        return {
            "total_students": total_students,
            "satisfied_students": satisfied_count,
            "satisfaction_rate": (satisfied_count / total_students * 100) if total_students > 0 else 0,
            "mutual_matches": mutual_matched,
            "total_groups": len(groups),
            "average_group_size": total_students / len(groups) if groups else 0
        }


def assign_students_to_groups(
    student_ids: List[int],
    preferences: Dict[int, Optional[int]],
    group_size: int = 3
) -> Tuple[List[List[int]], Dict[str, any]]:
    """
    Convenience function to run the group formation algorithm
    
    Args:
        student_ids: List of student IDs to assign
        preferences: Dict mapping student_id -> preferred_partner_id
        group_size: Desired size for each group (default 3)
    
    Returns:
        Tuple of (groups, stats) where:
            - groups: List of groups (each group is a list of student IDs)
            - stats: Dictionary with satisfaction metrics
    """
    algorithm = GroupFormationAlgorithm(group_size=group_size)
    groups = algorithm.form_groups(student_ids, preferences)
    stats = algorithm.calculate_satisfaction_score(groups)
    
    return groups, stats
