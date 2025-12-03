import 'package:flutter/material.dart';

class Step4Criteria extends StatelessWidget {
  final List<Map<String, dynamic>> criteria;
  final ValueChanged<int> onAddCriterion;
  final Function(int, String, dynamic) onCriterionChanged;

  const Step4Criteria({
    required this.criteria,
    required this.onAddCriterion,
    required this.onCriterionChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...criteria.asMap().entries.map((entry) {
          int index = entry.key;
          Map<String, dynamic> criterion = entry.value;
          return Column(
            children: [
              if (index > 0) SizedBox(height: isMobile ? 12 : 16),
              TextField(
                onChanged: (value) {
                  onCriterionChanged(index, 'name', value);
                },
                decoration: InputDecoration(
                  labelText: 'Criterion Name *',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              isMobile
                  ? Column(
                      children: [
                        TextField(
                          keyboardType: TextInputType.number,
                          onChanged: (value) {
                            onCriterionChanged(index, 'max_score', int.tryParse(value) ?? 100);
                          },
                          decoration: InputDecoration(
                            labelText: 'Max Score',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          keyboardType: TextInputType.number,
                          onChanged: (value) {
                            onCriterionChanged(index, 'percentage', double.tryParse(value) ?? 0);
                          },
                          decoration: InputDecoration(
                            labelText: 'Percentage %',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                          ),
                        ),
                      ],
                    )
                  : Row(
                      children: [
                        Expanded(
                          child: TextField(
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              onCriterionChanged(index, 'max_score', int.tryParse(value) ?? 100);
                            },
                            decoration: InputDecoration(
                              labelText: 'Max Score',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            keyboardType: TextInputType.number,
                            onChanged: (value) {
                              onCriterionChanged(index, 'percentage', double.tryParse(value) ?? 0);
                            },
                            decoration: InputDecoration(
                              labelText: 'Percentage %',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
              const SizedBox(height: 8),
              TextField(
                onChanged: (value) {
                  onCriterionChanged(index, 'description', value);
                },
                decoration: InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ),
            ],
          );
        }).toList(),
        const SizedBox(height: 12),
        SizedBox(
          width: isMobile ? double.infinity : null,
          child: ElevatedButton.icon(
            onPressed: () => onAddCriterion(0),
            icon: const Icon(Icons.add),
            label: const Text('Add Criterion'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 12 : 16,
                vertical: isMobile ? 8 : 10,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
