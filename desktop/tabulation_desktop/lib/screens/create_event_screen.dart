import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../widgets/podium_loader.dart';
import 'widgets/create_event/step1_basic_info.dart';
import 'widgets/create_event/step2_participants.dart';
import 'widgets/create_event/step3_categories.dart';
import 'widgets/create_event/step4_criteria.dart';
import 'widgets/create_event/templates.dart';

class CreateEventScreen extends StatefulWidget {
  const CreateEventScreen({super.key});

  @override
  State<CreateEventScreen> createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends State<CreateEventScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime? _selectedDate;
  int _numberOfJudges = 7;
  String _eventType = 'pageant';

  List<Map<String, dynamic>> _participants = [
    {'number': '', 'name': '', 'gender': 'Female', 'department': ''}
  ];

  // Update all participants' gender when event type changes
  void _onEventTypeChanged(String? newType) {
    if (newType == null) return;
    setState(() {
      _eventType = newType;
      // Update existing participants to use the new default gender
      final newGender = _getDefaultGenderForType(newType);
      for (var p in _participants) {
        // Only update if current gender doesn't match new event type
        final currentGender = p['gender'] ?? 'Female';
        if (!_isValidGenderForType(currentGender, newType)) {
          p['gender'] = newGender;
        }
      }
    });
  }

  String _getDefaultGenderForType(String eventType) {
    switch (eventType) {
      case 'solo_contest':
        return 'Solo';
      case 'group_contest':
        return 'Group';
      default:
        return 'Female';
    }
  }

  bool _isValidGenderForType(String gender, String eventType) {
    switch (eventType) {
      case 'solo_contest':
        return gender == 'Solo';
      case 'group_contest':
        return gender == 'Group';
      case 'pageant':
        return gender == 'Female' || gender == 'Male';
      default:
        return true; // Allow all for generic types
    }
  }
  List<Map<String, String>> _categories = [{'name': '', 'description': ''}];
  List<Map<String, dynamic>> _criteria = [
    {'name': '', 'max_score': 100, 'percentage': 0, 'description': ''}
  ];

  bool _isLoading = false;
  int? _eventId;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.text,
              onPrimary: Colors.white,
              surface: AppColors.background,
              onSurface: AppColors.text,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _createEvent() async {
    if (_titleController.text.isEmpty) {
      _showError('Please enter event name');
      return;
    }
    if (_selectedDate == null) {
      _showError('Please select event date');
      return;
    }
    if (!_participants.any((p) => p['name']?.toString().isNotEmpty ?? false)) {
      _showError('Please add at least one participant');
      return;
    }
    if (!_categories.any((c) => c['name']?.toString().isNotEmpty ?? false)) {
      _showError('Please add at least one category');
      return;
    }
    if (!_criteria.any((c) => c['name']?.toString().isNotEmpty ?? false)) {
      _showError('Please add at least one scoring criterion');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr =
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';

      final response = await http
          .post(
            Uri.parse('http://localhost:8000/api/events/save-draft'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'event_id': _eventId,
              'title': _titleController.text,
              'event_date': dateStr,
              'description': _descriptionController.text,
              'event_type': _eventType,
              'number_of_judges': _numberOfJudges,
              'candidates': _participants
                  .where((p) => p['name']?.toString().isNotEmpty ?? false)
                  .toList(),
              'categories': _categories
                  .where((c) => c['name']?.toString().isNotEmpty ?? false)
                  .toList(),
              'criteria': _criteria
                  .where((c) => c['name']?.toString().isNotEmpty ?? false)
                  .toList(),
            }),
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        _showSuccess('Event created!');
        if (mounted) Navigator.of(context).pop();
      } else {
        _showError('Failed to create event');
      }
    } catch (error) {
      _showError('Error: $error');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontSize: 12)),
        backgroundColor: AppColors.text,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontSize: 12)),
        backgroundColor: AppColors.text,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  String _getDefaultGender() {
    switch (_eventType) {
      case 'solo_contest':
        return 'Solo';
      case 'group_contest':
        return 'Group';
      default:
        return 'Female';
    }
  }

  void _applyParticipantTemplate() {
    setState(() {
      switch (_eventType) {
        case 'solo_contest':
          _participants = TemplateLibrary.soloCandidates.map((t) => t.toMap()).toList();
          break;
        case 'group_contest':
          _participants = TemplateLibrary.groupCandidates.map((t) => t.toMap()).toList();
          break;
        default:
          _participants = TemplateLibrary.sampleCandidates.map((t) => t.toMap()).toList();
      }
    });
  }

  void _applyCategoryTemplate() {
    setState(() {
      switch (_eventType) {
        case 'pageant':
          _categories = TemplateLibrary.pageantCategories.map((t) => t.toMap()).toList();
          break;
        case 'talent_show':
          _categories = TemplateLibrary.talentShowCategories.map((t) => t.toMap()).toList();
          break;
        case 'solo_contest':
          _categories = TemplateLibrary.soloContestCategories.map((t) => t.toMap()).toList();
          break;
        case 'group_contest':
          _categories = TemplateLibrary.groupContestCategories.map((t) => t.toMap()).toList();
          break;
        default:
          _categories = TemplateLibrary.pageantCategories.map((t) => t.toMap()).toList();
      }
    });
  }

  void _applyCriteriaTemplate() {
    setState(() {
      switch (_eventType) {
        case 'pageant':
          _criteria = TemplateLibrary.pageantCriteria.map((t) => t.toMap()).toList();
          break;
        case 'talent_show':
          _criteria = TemplateLibrary.talentCriteria.map((t) => t.toMap()).toList();
          break;
        case 'solo_contest':
          _criteria = TemplateLibrary.soloContestCriteria.map((t) => t.toMap()).toList();
          break;
        case 'group_contest':
          _criteria = TemplateLibrary.groupContestCriteria.map((t) => t.toMap()).toList();
          break;
        default:
          _criteria = TemplateLibrary.standardCriteria.map((t) => t.toMap()).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.text,
        elevation: 0,
        title: Text('New Event', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: AppColors.border),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick templates
            _buildTemplateRow(),
            const SizedBox(height: AppSpacing.lg),
            // Step 1
            _buildSection('Basic Info', Step1BasicInfo(
              titleController: _titleController,
              descriptionController: _descriptionController,
              selectedDate: _selectedDate,
              onSelectDate: _selectDate,
              eventType: _eventType,
              onEventTypeChanged: _onEventTypeChanged,
              numberOfJudges: _numberOfJudges,
              onNumberOfJudgesChanged: (v) => setState(() => _numberOfJudges = int.tryParse(v) ?? 7),
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 2
            _buildSection('Participants', Step2Participants(
              participants: _participants,
              eventType: _eventType,
              onAddParticipant: (_) => setState(() => _participants.add({'number': '', 'name': '', 'gender': _getDefaultGender(), 'department': ''})),
              onParticipantChanged: (i, f, v) => setState(() => _participants[i][f] = v),
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 3
            _buildSection('Categories', Step3Categories(
              categories: _categories,
              onAddCategory: (_) => setState(() => _categories.add({'name': '', 'description': ''})),
              onCategoryChanged: (i, f, v) => setState(() => _categories[i][f] = v),
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 4
            _buildSection('Scoring Criteria', Step4Criteria(
              criteria: _criteria,
              onAddCriterion: (_) => setState(() => _criteria.add({'name': '', 'max_score': 100, 'percentage': 0, 'description': ''})),
              onCriterionChanged: (i, f, v) => setState(() => _criteria[i][f] = v),
            )),
            const SizedBox(height: AppSpacing.xl),
            // Buttons
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
                      child: Center(child: Text('Cancel', style: AppTextStyles.button)),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: GestureDetector(
                    onTap: _isLoading ? null : _createEvent,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      decoration: BoxDecoration(
                        color: _isLoading ? AppColors.disabled : AppColors.text,
                        borderRadius: AppBorders.radius,
                      ),
                      child: Center(
                        child: _isLoading
                            ? const PodiumLoader(size: 14)
                            : Text('Create', style: AppTextStyles.button.copyWith(color: Colors.white)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTemplateRow() {
    return Row(
      children: [
        Text('Templates:', style: AppTextStyles.small),
        const SizedBox(width: AppSpacing.sm),
        _templateBtn('Candidates', _applyParticipantTemplate),
        const SizedBox(width: AppSpacing.sm),
        _templateBtn('Categories', _applyCategoryTemplate),
        const SizedBox(width: AppSpacing.sm),
        _templateBtn('Criteria', _applyCriteriaTemplate),
      ],
    );
  }

  Widget _templateBtn(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 4),
        decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
        child: Text(label, style: AppTextStyles.small.copyWith(fontSize: 10)),
      ),
    );
  }

  Widget _buildSection(String title, Widget child) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(border: AppBorders.all, borderRadius: AppBorders.radius),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, fontSize: 12)),
          const SizedBox(height: AppSpacing.md),
          child,
        ],
      ),
    );
  }
}
