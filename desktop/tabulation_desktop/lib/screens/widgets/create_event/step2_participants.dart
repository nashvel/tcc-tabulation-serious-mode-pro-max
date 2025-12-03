import 'package:flutter/material.dart';

class Step2Participants extends StatelessWidget {
  final List<Map<String, dynamic>> participants;
  final ValueChanged<int> onAddParticipant;
  final Function(int, String, dynamic) onParticipantChanged;

  const Step2Participants({
    required this.participants,
    required this.onAddParticipant,
    required this.onParticipantChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...participants.asMap().entries.map((entry) {
          int index = entry.key;
          Map<String, dynamic> participant = entry.value;
          return Column(
            children: [
              if (index > 0) SizedBox(height: isMobile ? 12 : 16),
              isMobile
                  ? Column(
                      children: [
                        TextField(
                          onChanged: (value) {
                            onParticipantChanged(index, 'number', value);
                          },
                          decoration: InputDecoration(
                            labelText: 'No.',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          onChanged: (value) {
                            onParticipantChanged(index, 'name', value);
                          },
                          decoration: InputDecoration(
                            labelText: 'Name *',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: DropdownButtonFormField<String>(
                            value: participant['gender'] ?? 'Female',
                            items: ['Female', 'Male']
                                .map((g) => DropdownMenuItem(
                                      value: g,
                                      child: Text(g),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              onParticipantChanged(index, 'gender', value ?? 'Female');
                            },
                            decoration: InputDecoration(
                              labelText: 'Gender',
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
                    )
                  : Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              flex: 1,
                              child: TextField(
                                onChanged: (value) {
                                  onParticipantChanged(index, 'number', value);
                                },
                                decoration: InputDecoration(
                                  labelText: 'No.',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 8,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 2,
                              child: TextField(
                                onChanged: (value) {
                                  onParticipantChanged(index, 'name', value);
                                },
                                decoration: InputDecoration(
                                  labelText: 'Name *',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 8,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: DropdownButtonFormField<String>(
                            value: participant['gender'] ?? 'Female',
                            items: ['Female', 'Male']
                                .map((g) => DropdownMenuItem(
                                      value: g,
                                      child: Text(g),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              onParticipantChanged(index, 'gender', value ?? 'Female');
                            },
                            decoration: InputDecoration(
                              labelText: 'Gender',
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
            ],
          );
        }).toList(),
        const SizedBox(height: 12),
        SizedBox(
          width: isMobile ? double.infinity : null,
          child: ElevatedButton.icon(
            onPressed: () => onAddParticipant(0),
            icon: const Icon(Icons.add),
            label: const Text('Add Participant'),
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
