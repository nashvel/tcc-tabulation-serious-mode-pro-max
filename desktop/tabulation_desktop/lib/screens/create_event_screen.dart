import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'widgets/create_event/step1_basic_info.dart';
import 'widgets/create_event/step2_participants.dart';
import 'widgets/create_event/step3_categories.dart';
import 'widgets/create_event/step4_criteria.dart';
import 'widgets/create_event/section_card.dart';
import 'widgets/create_event/template_selector.dart';
import 'widgets/create_event/templates.dart';

class CreateEventScreen extends StatefulWidget {
  const CreateEventScreen({super.key});

  @override
  State<CreateEventScreen> createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends State<CreateEventScreen> {
  // Step 1: Basic Info
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime? _selectedDate;
  int _numberOfJudges = 7;
  String _eventType = 'pageant';

  // Step 2: Participants
  List<Map<String, dynamic>> _participants = [
    {'number': '', 'name': '', 'gender': 'Female', 'department': ''}
  ];

  // Step 3: Categories
  List<Map<String, String>> _categories = [
    {'name': '', 'description': ''}
  ];

  // Step 4: Criteria/Score Rules
  List<Map<String, dynamic>> _criteria = [
    {'name': '', 'max_score': 100, 'percentage': 0, 'description': ''}
  ];

  bool _isLoading = false;
  int _currentStep = 1;
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
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _createEvent() async {
    // Validate Step 1
    if (_titleController.text.isEmpty) {
      _showError('Please enter event name');
      return;
    }
    if (_selectedDate == null) {
      _showError('Please select event date');
      return;
    }

    // Validate Step 2
    bool hasParticipants = _participants.any((p) => p['name']?.toString().isNotEmpty ?? false);
    if (!hasParticipants) {
      _showError('Please add at least one participant');
      return;
    }

    // Validate Step 3
    bool hasCategories = _categories.any((c) => c['name']?.toString().isNotEmpty ?? false);
    if (!hasCategories) {
      _showError('Please add at least one category');
      return;
    }

    // Validate Step 4
    bool hasCriteria = _criteria.any((c) => c['name']?.toString().isNotEmpty ?? false);
    if (!hasCriteria) {
      _showError('Please add at least one scoring criterion');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr = '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
      
      final response = await http.post(
        Uri.parse('http://localhost:8000/api/events/save-draft'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'event_id': _eventId,
          'title': _titleController.text,
          'event_date': dateStr,
          'description': _descriptionController.text,
          'event_type': _eventType,
          'number_of_judges': _numberOfJudges,
          'candidates': _participants.where((p) => p['name']?.toString().isNotEmpty ?? false).toList(),
          'categories': _categories.where((c) => c['name']?.toString().isNotEmpty ?? false).toList(),
          'criteria': _criteria.where((c) => c['name']?.toString().isNotEmpty ?? false).toList(),
        }),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        _showSuccess('Event created successfully!');
        if (mounted) {
          Navigator.of(context).pop();
        }
      } else {
        _showError('Failed to create event');
      }
    } catch (error) {
      _showError('Error: $error');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _applyParticipantTemplate() {
    setState(() {
      _participants = TemplateLibrary.sampleCandidates
          .map((t) => t.toMap())
          .toList();
    });
    _showSuccess('Sample candidates added!');
  }

  void _applyCategoryTemplate() {
    setState(() {
      if (_eventType == 'pageant') {
        _categories = TemplateLibrary.pageantCategories
            .map((t) => t.toMap())
            .toList();
      } else if (_eventType == 'talent_show') {
        _categories = TemplateLibrary.talentShowCategories
            .map((t) => t.toMap())
            .toList();
      }
    });
    _showSuccess('Categories added!');
  }

  void _applyCriteriaTemplate() {
    setState(() {
      if (_eventType == 'pageant') {
        _criteria = TemplateLibrary.pageantCriteria
            .map((t) => t.toMap())
            .toList();
      } else if (_eventType == 'talent_show') {
        _criteria = TemplateLibrary.talentCriteria
            .map((t) => t.toMap())
            .toList();
      } else {
        _criteria = TemplateLibrary.standardCriteria
            .map((t) => t.toMap())
            .toList();
      }
    });
    _showSuccess('Scoring criteria added!');
  }


  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final padding = isMobile ? 12.0 : 24.0;
    final labelFontSize = isMobile ? 12.0 : 14.0;
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Create New Event',
          style: TextStyle(
            fontSize: isMobile ? 16 : 18,
          ),
        ),
        backgroundColor: Colors.blue.shade900,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        color: Colors.grey.shade50,
        child: SingleChildScrollView(
          child: Padding(
            padding: EdgeInsets.all(padding),
            child: Column(
              children: [
                // STEP 1: BASIC INFO
                SectionCard(
                  title: 'Step 1: Basic Information',
                  padding: padding,
                  labelFontSize: labelFontSize,
                  child: Step1BasicInfo(
                    titleController: _titleController,
                    descriptionController: _descriptionController,
                    selectedDate: _selectedDate,
                    onSelectDate: _selectDate,
                    eventType: _eventType,
                    onEventTypeChanged: (value) {
                      setState(() => _eventType = value ?? 'pageant');
                    },
                    numberOfJudges: _numberOfJudges,
                    onNumberOfJudgesChanged: (value) {
                      setState(() => _numberOfJudges = int.tryParse(value) ?? 7);
                    },
                    padding: padding,
                    labelFontSize: labelFontSize,
                  ),
                ),
                const SizedBox(height: 16),

                // TEMPLATE SELECTOR
                TemplateSelector(
                  eventType: _eventType,
                  onApplyCandidateTemplate: _applyParticipantTemplate,
                  onApplyCategoryTemplate: _applyCategoryTemplate,
                  onApplyCriteriaTemplate: _applyCriteriaTemplate,
                ),
                const SizedBox(height: 20),

                // STEP 2: PARTICIPANTS
                SectionCard(
                  title: 'Step 2: Participants',
                  padding: padding,
                  labelFontSize: labelFontSize,
                  child: Step2Participants(
                    participants: _participants,
                    onAddParticipant: (_) {
                      setState(() => _participants.add(
                        {'number': '', 'name': '', 'gender': 'Female', 'department': ''}
                      ));
                    },
                    onParticipantChanged: (index, field, value) {
                      setState(() => _participants[index][field] = value);
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // STEP 3: CATEGORIES
                SectionCard(
                  title: 'Step 3: Categories',
                  padding: padding,
                  labelFontSize: labelFontSize,
                  child: Step3Categories(
                    categories: _categories,
                    onAddCategory: (_) {
                      setState(() => _categories.add({'name': '', 'description': ''}));
                    },
                    onCategoryChanged: (index, field, value) {
                      setState(() => _categories[index][field] = value);
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // STEP 4: CRITERIA/SCORE RULES
                SectionCard(
                  title: 'Step 4: Scoring Criteria',
                  padding: padding,
                  labelFontSize: labelFontSize,
                  child: Step4Criteria(
                    criteria: _criteria,
                    onAddCriterion: (_) {
                      setState(() => _criteria.add(
                        {'name': '', 'max_score': 100, 'percentage': 0, 'description': ''}
                      ));
                    },
                    onCriterionChanged: (index, field, value) {
                      setState(() => _criteria[index][field] = value);
                    },
                  ),
                ),
                const SizedBox(height: 24),

                // SUBMIT BUTTONS
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _createEvent,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text('Create Event'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
