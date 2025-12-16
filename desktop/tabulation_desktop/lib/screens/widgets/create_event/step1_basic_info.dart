import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step1BasicInfo extends StatefulWidget {
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
  State<Step1BasicInfo> createState() => _Step1BasicInfoState();
}

class _Step1BasicInfoState extends State<Step1BasicInfo> {
  bool _isCustomType = false;
  final _customTypeController = TextEditingController();

  // Predefined event types
  static const Map<String, String> _eventTypes = {
    'pageant': 'Pageant',
    'solo_contest': 'Solo Contest',
    'group_contest': 'Group/Team Contest',
    'talent_show': 'Talent Show',
    'competition': 'Competition',
    'custom': '+ Custom Type...',
  };

  @override
  void initState() {
    super.initState();
    // Check if current eventType is custom (not in predefined list)
    if (!_eventTypes.keys.contains(widget.eventType) && widget.eventType != 'custom') {
      _isCustomType = true;
      _customTypeController.text = widget.eventType;
    }
  }

  @override
  void dispose() {
    _customTypeController.dispose();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _label('Title *'),
        _textField(widget.titleController, 'Event name'),
        const SizedBox(height: AppSpacing.md),
        _label('Date *'),
        _datePicker(),
        const SizedBox(height: AppSpacing.md),
        _label('Description'),
        _textField(widget.descriptionController, 'Optional description', maxLines: 2),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _label('Type'),
                  _isCustomType ? _customTypeField() : _dropdown(),
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
      onTap: widget.onSelectDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
        decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, size: 14, color: AppColors.textMuted),
            const SizedBox(width: AppSpacing.sm),
            Text(
              widget.selectedDate == null
                  ? 'Select date'
                  : '${widget.selectedDate!.year}-${widget.selectedDate!.month.toString().padLeft(2, '0')}-${widget.selectedDate!.day.toString().padLeft(2, '0')}',
              style: AppTextStyles.body.copyWith(
                color: widget.selectedDate == null ? AppColors.disabled : AppColors.text,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }


  Widget _dropdown() {
    // Determine current value for dropdown
    String dropdownValue = _eventTypes.keys.contains(widget.eventType) 
        ? widget.eventType 
        : 'custom';
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: dropdownValue,
          isExpanded: true,
          style: AppTextStyles.body.copyWith(fontSize: 12),
          items: _eventTypes.entries.map((e) {
            final isCustomOption = e.key == 'custom';
            return DropdownMenuItem(
              value: e.key,
              child: Text(
                e.value,
                style: AppTextStyles.body.copyWith(
                  fontSize: 11,
                  color: isCustomOption ? AppColors.textMuted : AppColors.text,
                  fontStyle: isCustomOption ? FontStyle.italic : FontStyle.normal,
                ),
              ),
            );
          }).toList(),
          onChanged: (value) {
            if (value == 'custom') {
              setState(() => _isCustomType = true);
              // Don't change event type yet, wait for user input
            } else {
              widget.onEventTypeChanged(value);
            }
          },
        ),
      ),
    );
  }

  Widget _customTypeField() {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _customTypeController,
              style: AppTextStyles.body.copyWith(fontSize: 12),
              decoration: const InputDecoration(
                hintText: 'Enter custom type...',
                hintStyle: TextStyle(color: AppColors.disabled, fontSize: 12),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
              ),
              onChanged: (value) {
                // Update event type as user types
                if (value.isNotEmpty) {
                  widget.onEventTypeChanged(value.toLowerCase().replaceAll(' ', '_'));
                }
              },
              onSubmitted: (value) {
                if (value.isEmpty) {
                  // If empty, go back to dropdown
                  setState(() => _isCustomType = false);
                  widget.onEventTypeChanged('pageant');
                }
              },
            ),
          ),
          // Back to dropdown button
          GestureDetector(
            onTap: () {
              setState(() => _isCustomType = false);
              _customTypeController.clear();
              widget.onEventTypeChanged('pageant');
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: const Icon(Icons.close, size: 14, color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  Widget _judgesField() {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextField(
        keyboardType: TextInputType.number,
        onChanged: widget.onNumberOfJudgesChanged,
        style: AppTextStyles.body.copyWith(fontSize: 12),
        decoration: InputDecoration(
          hintText: '${widget.numberOfJudges}',
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 12),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: AppSpacing.sm),
        ),
      ),
    );
  }
}
