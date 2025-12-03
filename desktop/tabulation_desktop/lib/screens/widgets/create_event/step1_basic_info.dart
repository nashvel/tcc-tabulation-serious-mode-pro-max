import 'package:flutter/material.dart';

class Step1BasicInfo extends StatelessWidget {
  final TextEditingController titleController;
  final TextEditingController descriptionController;
  final DateTime? selectedDate;
  final VoidCallback onSelectDate;
  final String eventType;
  final ValueChanged<String?> onEventTypeChanged;
  final int numberOfJudges;
  final ValueChanged<String> onNumberOfJudgesChanged;
  final double padding;
  final double labelFontSize;

  const Step1BasicInfo({
    required this.titleController,
    required this.descriptionController,
    required this.selectedDate,
    required this.onSelectDate,
    required this.eventType,
    required this.onEventTypeChanged,
    required this.numberOfJudges,
    required this.onNumberOfJudgesChanged,
    required this.padding,
    required this.labelFontSize,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel('Event Title *'),
        _buildTextField(titleController, 'e.g., TCC Intramurals 2025'),
        const SizedBox(height: 16),
        _buildLabel('Event Date *'),
        _buildDatePicker(),
        const SizedBox(height: 16),
        _buildLabel('Description'),
        _buildTextField(descriptionController, 'Event description', maxLines: 3),
        const SizedBox(height: 16),
        _buildLabel('Event Type'),
        DropdownButtonFormField<String>(
          value: eventType,
          items: ['pageant', 'talent_show', 'competition']
              .map((type) => DropdownMenuItem(
                    value: type,
                    child: Text(type),
                  ))
              .toList(),
          onChanged: onEventTypeChanged,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
          ),
        ),
        const SizedBox(height: 16),
        _buildLabel('Number of Judges'),
        TextField(
          keyboardType: TextInputType.number,
          onChanged: onNumberOfJudgesChanged,
          decoration: InputDecoration(
            hintText: '$numberOfJudges',
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
  }

  Widget _buildLabel(String label) {
    return Text(
      label,
      style: TextStyle(
        fontSize: labelFontSize,
        fontWeight: FontWeight.bold,
        color: Colors.grey.shade700,
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint, {
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: onSelectDate,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 10,
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today, color: Colors.blue.shade600, size: 18),
            const SizedBox(width: 12),
            Text(
              selectedDate == null
                  ? 'Select date'
                  : '${selectedDate!.year}-${selectedDate!.month.toString().padLeft(2, '0')}-${selectedDate!.day.toString().padLeft(2, '0')}',
              style: TextStyle(
                color: selectedDate == null ? Colors.grey : Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
