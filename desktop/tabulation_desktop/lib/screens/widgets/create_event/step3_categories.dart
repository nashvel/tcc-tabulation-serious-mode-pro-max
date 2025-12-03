import 'package:flutter/material.dart';

class Step3Categories extends StatelessWidget {
  final List<Map<String, String>> categories;
  final ValueChanged<int> onAddCategory;
  final Function(int, String, String) onCategoryChanged;

  const Step3Categories({
    required this.categories,
    required this.onAddCategory,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...categories.asMap().entries.map((entry) {
          int index = entry.key;
          Map<String, String> category = entry.value;
          return Column(
            children: [
              if (index > 0) SizedBox(height: isMobile ? 12 : 16),
              TextField(
                onChanged: (value) {
                  onCategoryChanged(index, 'name', value);
                },
                decoration: InputDecoration(
                  labelText: 'Category Name *',
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
                onChanged: (value) {
                  onCategoryChanged(index, 'description', value);
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
            onPressed: () => onAddCategory(0),
            icon: const Icon(Icons.add),
            label: const Text('Add Category'),
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
