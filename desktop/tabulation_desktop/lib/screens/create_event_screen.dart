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
  int _numberOfJudges = 5;
  String _eventType = 'pageant';

  // Participants list (matches Vue structure)
  List<Map<String, dynamic>> _participants = [];

  // Rounds list with criteria (matches Vue structure)
  List<Map<String, dynamic>> _rounds = [];

  bool _isLoading = false;
  int? _eventId;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _onEventTypeChanged(String? newType) {
    if (newType == null) return;
    setState(() {
      _eventType = newType;
      final newGender = _getDefaultGenderForType(newType);
      for (var p in _participants) {
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
        return true;
    }
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
      _showError('Please enter event title');
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
    if (!_rounds.any((r) => r['name']?.toString().isNotEmpty ?? false)) {
      _showError('Please add at least one round');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr =
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';

      // Step 1: Create the event (same as Vue)
      final eventResponse = await http.post(
        Uri.parse('http://localhost:8000/api/events'),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: jsonEncode({
          'title': _titleController.text,
          'event_date': dateStr,
          'event_type': _eventType,
          'number_of_judges': _numberOfJudges,
          'description': _descriptionController.text,
          'year': _selectedDate!.year,
          'status': 'active',
        }),
      ).timeout(const Duration(seconds: 10));

      if (eventResponse.statusCode != 200 && eventResponse.statusCode != 201) {
        _showError('Failed to create event');
        return;
      }

      final eventData = jsonDecode(eventResponse.body);
      final eventId = eventData['id'];

      // Step 2: Create candidates (participants) - same as Vue
      for (final p in _participants) {
        if (p['name']?.toString().isNotEmpty ?? false) {
          await http.post(
            Uri.parse('http://localhost:8000/api/candidates'),
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: jsonEncode({
              'event_id': eventId,
              'number': int.tryParse(p['number']?.toString() ?? '') ?? 0,
              'name': p['name'],
              'gender': p['gender'],
              'participant_type': (p['gender'] ?? 'female').toString().toLowerCase(),
              'order': int.tryParse(p['number']?.toString() ?? '') ?? 0,
            }),
          );
        }
      }

      // Step 3: Create rounds and criteria - same as Vue
      int spot = 1;
      for (final r in _rounds) {
        if (r['name']?.toString().isNotEmpty ?? false) {
          final roundResponse = await http.post(
            Uri.parse('http://localhost:8000/api/rounds'),
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
            body: jsonEncode({
              'event_id': eventId,
              'name': r['name'],
              'spot': spot++,
            }),
          );

          if (roundResponse.statusCode == 200 || roundResponse.statusCode == 201) {
            final roundData = jsonDecode(roundResponse.body);
            final roundId = roundData['id'];

            // Create criteria for this round
            final criteria = (r['criteria'] as List<dynamic>?) ?? [];
            for (final c in criteria) {
              if (c['name']?.toString().isNotEmpty ?? false) {
                await http.post(
                  Uri.parse('http://localhost:8000/api/criteria'),
                  headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                  body: jsonEncode({
                    'round_id': roundId,
                    'name': c['name'],
                    'points': c['points'] ?? 0,
                  }),
                );
              }
            }
          }
        }
      }

      // Step 4: Create judges - same as Vue
      for (int i = 1; i <= _numberOfJudges; i++) {
        await http.post(
          Uri.parse('http://localhost:8000/api/judges'),
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: jsonEncode({
            'event_id': eventId,
            'name': 'Judge $i',
            'chair_number': i,
            'status': 'active',
          }),
        );
      }

      _showSuccess('Event created!');
      if (mounted) Navigator.of(context).pop();
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

  // Add participant
  void _addParticipant() {
    setState(() {
      final nextNumber = _participants.length + 1;
      _participants.add({
        'number': nextNumber.toString(),
        'name': '',
        'gender': _getDefaultGender(),
      });
    });
  }

  // Add round
  void _addRound() {
    setState(() {
      _rounds.add({
        'name': '',
        'criteria': <Map<String, dynamic>>[],
      });
    });
  }

  // Remove round
  void _removeRound(int index) {
    setState(() {
      _rounds.removeAt(index);
    });
  }

  // Add criteria to a round
  void _addCriteria(int roundIndex) {
    setState(() {
      final criteria = (_rounds[roundIndex]['criteria'] as List<dynamic>?) ?? [];
      criteria.add({'name': '', 'points': 0});
      _rounds[roundIndex]['criteria'] = criteria;
    });
  }

  // Remove criteria from a round
  void _removeCriteria(int roundIndex, int criteriaIndex) {
    setState(() {
      final criteria = (_rounds[roundIndex]['criteria'] as List<dynamic>?) ?? [];
      if (criteriaIndex < criteria.length) {
        criteria.removeAt(criteriaIndex);
        _rounds[roundIndex]['criteria'] = criteria;
      }
    });
  }

  // Template functions
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

  void _applyRoundTemplate() {
    setState(() {
      // Apply rounds with criteria based on event type
      switch (_eventType) {
        case 'pageant':
          _rounds = [
            {'name': 'Casual Wear', 'criteria': [{'name': 'Poise', 'points': 30}, {'name': 'Projection', 'points': 30}, {'name': 'Attire', 'points': 40}]},
            {'name': 'Formal Wear', 'criteria': [{'name': 'Elegance', 'points': 40}, {'name': 'Stage Presence', 'points': 30}, {'name': 'Attire', 'points': 30}]},
            {'name': 'Q&A', 'criteria': [{'name': 'Content', 'points': 50}, {'name': 'Delivery', 'points': 30}, {'name': 'Confidence', 'points': 20}]},
          ];
          break;
        case 'talent_show':
          _rounds = [
            {'name': 'Performance', 'criteria': [{'name': 'Talent', 'points': 40}, {'name': 'Stage Presence', 'points': 30}, {'name': 'Creativity', 'points': 30}]},
          ];
          break;
        case 'solo_contest':
          _rounds = [
            {'name': 'Solo Performance', 'criteria': [{'name': 'Skill', 'points': 40}, {'name': 'Presentation', 'points': 30}, {'name': 'Creativity', 'points': 30}]},
          ];
          break;
        case 'group_contest':
          _rounds = [
            {'name': 'Group Performance', 'criteria': [{'name': 'Coordination', 'points': 30}, {'name': 'Creativity', 'points': 35}, {'name': 'Impact', 'points': 35}]},
          ];
          break;
        default:
          _rounds = [
            {'name': 'Round 1', 'criteria': [{'name': 'Criteria 1', 'points': 50}, {'name': 'Criteria 2', 'points': 50}]},
          ];
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
        title: Text('Create New Event', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
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
            // Step 1: Basic Info
            _buildSection('1. Basic Info', Step1BasicInfo(
              titleController: _titleController,
              descriptionController: _descriptionController,
              selectedDate: _selectedDate,
              onSelectDate: _selectDate,
              eventType: _eventType,
              onEventTypeChanged: _onEventTypeChanged,
              numberOfJudges: _numberOfJudges,
              onNumberOfJudgesChanged: (v) => setState(() => _numberOfJudges = int.tryParse(v) ?? 5),
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 2: Participants
            _buildSection('2. Participants', Step2Participants(
              participants: _participants,
              eventType: _eventType,
              onAddParticipant: (_) => _addParticipant(),
              onParticipantChanged: (i, f, v) => setState(() => _participants[i][f] = v),
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 3: Rounds
            _buildSection('3. Rounds', Step3Rounds(
              rounds: _rounds,
              onAddRound: (_) => _addRound(),
              onRoundChanged: (i, f, v) => setState(() => _rounds[i][f] = v),
              onRemoveRound: _removeRound,
            )),
            const SizedBox(height: AppSpacing.lg),
            // Step 4: Criteria
            _buildSection('4. Scoring Criteria', Step4Criteria(
              rounds: _rounds,
              onAddCriteria: _addCriteria,
              onCriteriaChanged: (ri, ci, f, v) => setState(() {
                final criteria = (_rounds[ri]['criteria'] as List<dynamic>?) ?? [];
                if (ci < criteria.length) {
                  criteria[ci][f] = v;
                }
              }),
              onRemoveCriteria: _removeCriteria,
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
                            : Text('Create Event', style: AppTextStyles.button.copyWith(color: Colors.white)),
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
        _templateBtn('Participants', _applyParticipantTemplate),
        const SizedBox(width: AppSpacing.sm),
        _templateBtn('Rounds + Criteria', _applyRoundTemplate),
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
