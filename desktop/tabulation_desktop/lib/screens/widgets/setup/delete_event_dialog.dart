import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DeleteEventDialog extends StatefulWidget {
  final dynamic event;
  final Future<void> Function() onConfirmDelete;

  const DeleteEventDialog({
    super.key,
    required this.event,
    required this.onConfirmDelete,
  });

  static Future<void> show(
    BuildContext context, {
    required dynamic event,
    required Future<void> Function() onConfirmDelete,
  }) {
    return showDialog(
      context: context,
      builder: (context) => DeleteEventDialog(
        event: event,
        onConfirmDelete: onConfirmDelete,
      ),
    );
  }

  @override
  State<DeleteEventDialog> createState() => _DeleteEventDialogState();
}

class _DeleteEventDialogState extends State<DeleteEventDialog> {
  final _confirmController = TextEditingController();
  bool _isConfirmed = false;
  bool _isDeleting = false;

  @override
  void dispose() {
    _confirmController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final eventTitle = widget.event['title'] ?? 'Untitled';
    final isMobile = MediaQuery.of(context).size.width < 600;

    return AlertDialog(
      title: Text(
        'Delete Event',
        style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Are you sure you want to delete "$eventTitle"?',
            style: GoogleFonts.inter(),
          ),
          const SizedBox(height: 8),
          Text(
            'This action cannot be undone.',
            style: GoogleFonts.inter(
              color: Colors.red,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _confirmController,
            decoration: InputDecoration(
              hintText: 'Type "$eventTitle" to confirm',
              hintStyle: TextStyle(fontSize: isMobile ? 12 : 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: EdgeInsets.symmetric(
                horizontal: 12,
                vertical: isMobile ? 8 : 12,
              ),
            ),
            onChanged: (value) {
              setState(() {
                _isConfirmed = value == eventTitle;
              });
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: _isDeleting ? null : () => Navigator.pop(context),
          child: Text(
            'Cancel',
            style: GoogleFonts.inter(color: Colors.grey),
          ),
        ),
        ElevatedButton(
          onPressed: (_isConfirmed && !_isDeleting)
              ? () async {
                  setState(() => _isDeleting = true);
                  await widget.onConfirmDelete();
                  if (context.mounted) Navigator.pop(context);
                }
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            disabledBackgroundColor: Colors.red.shade200,
          ),
          child: _isDeleting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(
                  'Delete',
                  style: GoogleFonts.inter(color: Colors.white),
                ),
        ),
      ],
    );
  }
}
