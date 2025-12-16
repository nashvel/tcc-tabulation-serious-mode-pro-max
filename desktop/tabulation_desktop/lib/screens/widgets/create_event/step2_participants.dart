import 'package:flutter/material.dart';
import '../../../theme/app_theme.dart';

class Step2Participants extends StatelessWidget {
  final List<Map<String, dynamic>> participants;
  final ValueChanged<int> onAddParticipant;
  final Function(int, String, dynamic) onParticipantChanged;
  final String eventType;

  const Step2Participants({
    super.key,
    required this.participants,
    required this.onAddParticipant,
    required this.onParticipantChanged,
    this.eventType = 'pageant',
  });

  // Get participant type label based on event type
  String get _typeLabel {
    switch (eventType) {
      case 'solo_contest':
        return 'Type';
      case 'group_contest':
        return 'Type';
      default:
        return 'Gender';
    }
  }

  // Get available options based on event type
  List<String> get _typeOptions {
    switch (eventType) {
      case 'solo_contest':
        return ['Solo'];
      case 'group_contest':
        return ['Group'];
      case 'pageant':
        // Pageant supports multiple gender categories including LGBTQ+
        return ['Female', 'Male', 'LGBTQ+', 'Trans', 'Non-Binary', 'Custom'];
      case 'talent_show':
      case 'competition':
        return ['Female', 'Male', 'LGBTQ+', 'Trans', 'Non-Binary', 'Solo', 'Group', 'Custom'];
      default:
        // For custom event types, allow all options
        return ['Female', 'Male', 'LGBTQ+', 'Trans', 'Non-Binary', 'Solo', 'Group', 'Custom'];
    }
  }

  // Get default value based on event type
  String get _defaultType {
    switch (eventType) {
      case 'solo_contest':
        return 'Solo';
      case 'group_contest':
        return 'Group';
      default:
        return 'Female';
    }
  }

  Widget _buildInfoBanner() {
    String? message;
    IconData? icon;

    switch (eventType) {
      case 'solo_contest':
        message = 'Solo contest: All participants compete together (no gender separation)';
        icon = Icons.person;
        break;
      case 'group_contest':
        message = 'Group contest: Teams/groups compete together';
        icon = Icons.groups;
        break;
      case 'pageant':
        message = 'Pageant: Supports Male, Female, LGBTQ+, Trans, Non-Binary categories';
        icon = Icons.people;
        break;
      default:
        // Custom event type
        if (!['talent_show', 'competition'].contains(eventType)) {
          message = 'Custom event: Choose participant type for each entry';
          icon = Icons.tune;
        }
    }

    if (message == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.border.withOpacity(0.3),
        borderRadius: AppBorders.radius,
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.textMuted),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              message,
              style: AppTextStyles.small.copyWith(color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Info banner for event type
        _buildInfoBanner(),
        // Header row
        Row(
          children: [
            SizedBox(width: 40, child: Text('No.', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            Expanded(flex: 2, child: Text('Name *', style: AppTextStyles.small)),
            const SizedBox(width: AppSpacing.sm),
            SizedBox(width: 100, child: Text(_typeLabel, style: AppTextStyles.small)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Container(height: 1, color: AppColors.border),
        const SizedBox(height: AppSpacing.sm),
        // Participant rows
        ...participants.asMap().entries.map((entry) {
          final i = entry.key;
          final p = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: Row(
              children: [
                SizedBox(
                  width: 40,
                  child: _field((v) => onParticipantChanged(i, 'number', v), p['number']?.toString() ?? ''),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  flex: 2,
                  child: _field((v) => onParticipantChanged(i, 'name', v), p['name']?.toString() ?? ''),
                ),
                const SizedBox(width: AppSpacing.sm),
                SizedBox(
                  width: 100,
                  child: _typeDropdown(i, p['gender'] ?? _defaultType),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: AppSpacing.sm),
        GestureDetector(
          onTap: () => onAddParticipant(0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.add, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text('Add', style: AppTextStyles.small.copyWith(color: AppColors.textMuted)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _field(ValueChanged<String> onChanged, String initial, {String? hint}) {
    return Container(
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: TextFormField(
        initialValue: initial,
        onChanged: onChanged,
        style: AppTextStyles.body.copyWith(fontSize: 11),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.disabled, fontSize: 11),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
          isDense: true,
        ),
      ),
    );
  }

  Widget _typeDropdown(int index, String value) {
    // Ensure value is in the options list
    final options = _typeOptions;
    final safeValue = options.contains(value) ? value : _defaultType;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: safeValue,
          isExpanded: true,
          isDense: true,
          style: AppTextStyles.body.copyWith(fontSize: 11),
          items: options.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
          onChanged: (v) => onParticipantChanged(index, 'gender', v ?? _defaultType),
        ),
      ),
    );
  }
}
