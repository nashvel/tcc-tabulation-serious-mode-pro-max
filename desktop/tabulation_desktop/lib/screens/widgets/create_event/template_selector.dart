import 'package:flutter/material.dart';
import 'templates.dart';

class TemplateSelector extends StatelessWidget {
  final String eventType;
  final VoidCallback onApplyCandidateTemplate;
  final VoidCallback onApplyCategoryTemplate;
  final VoidCallback onApplyCriteriaTemplate;

  const TemplateSelector({
    required this.eventType,
    required this.onApplyCandidateTemplate,
    required this.onApplyCategoryTemplate,
    required this.onApplyCriteriaTemplate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        border: Border.all(color: Colors.blue.shade200),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.lightbulb, color: Colors.blue.shade600, size: 18),
              const SizedBox(width: 8),
              Text(
                'Quick Templates',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildTemplateButton(
                'Sample Candidates',
                Icons.person_add,
                onApplyCandidateTemplate,
              ),
              _buildTemplateButton(
                'Categories',
                Icons.category,
                onApplyCategoryTemplate,
              ),
              _buildTemplateButton(
                'Criteria',
                Icons.checklist,
                onApplyCriteriaTemplate,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTemplateButton(
    String label,
    IconData icon,
    VoidCallback onPressed,
  ) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 14),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue.shade600,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        textStyle: const TextStyle(fontSize: 11),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(6),
        ),
      ),
    );
  }
}
