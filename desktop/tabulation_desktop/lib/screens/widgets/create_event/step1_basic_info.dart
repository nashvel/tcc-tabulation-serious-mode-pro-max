import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step1BasicInfo extends StatelessWidget {
  final TextEditingController titleController;
  final TextEditingController descriptionController;
  final DateTime? selectedDate;
  final VoidCallback onSelectDate;
  final String eventType;
  final ValueChanged<String?> onEventTypeChanged;
  final int numberOfJudges;
  final ValueChanged<String> onNumberOfJudgesChanged;

  const Step1BasicInfo({
    super.key,
    required this.titleController,
    required this.descriptionController,
    required this.selectedDate,
    required this.onSelectDate,
    required this.eventType,
    required this.onEventTypeChanged,
    required this.numberOfJudges,
    required this.onNumberOfJudgesChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label('Title *'),
        _textField(titleController, 'Event name'),
        const SizedBox(height: AppSpacing.md),
        _label('Date *'),
        _datePicker(),
        const SizedBox(height: AppSpacing.md),
        _label('Description'),
        _textField(descriptionController, 'Optional description', maxLines: 2),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _label('Type'),
                  _dropdown(),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _label('Judges'),
                  _judgesField(),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(text, style: AppTextStyles.small),
    );
  }

  Widget _textField(TextEditingController controller, String hint, {int maxLines = 1}) {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        controller: controller,
        maxLines: maxLines,
        style: AppTextStyles.body,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
        ),
      ),
    );
  }

  Widget _datePicker() {
    return GestureDetector(
      onTap: onSelectDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
        decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, size: 14, color: AppColors.textMuted),
            const SizedBox(width: AppSpacing.sm),
            Text(
              selectedDate == null
                  ? 'Select date'
                  : '${selectedDate!.year}-${selectedDate!.month.toString().padLeft(2, '0')}-${selectedDate!.day.toString().padLeft(2, '0')}',
              style: AppTextStyles.body.copyWith(
                color: selectedDate == null ? AppColors.disabled : AppColors.text,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: eventType,
          isExpanded: true,
          style: AppTextStyles.body.copyWith(fontSize: 12),
          items: ['pageant', 'talent_show', 'competition']
              .map((t) => DropdownMenuItem(value: t, child: Text(t)))
              .toList(),
          onChanged: onEventTypeChanged,
        ),
      ),
    );
  }

  Widget _judgesField() {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        keyboardType: TextInputType.number,
        onChanged: onNumberOfJudgesChanged,
        style: AppTextStyles.body.copyWith(fontSize: 12),
        decoration: InputDecoration(
          hintText: '$numberOfJudges',
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
        ),
      ),
    );
  }
}
