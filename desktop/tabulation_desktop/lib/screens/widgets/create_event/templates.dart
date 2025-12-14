// Predefined templates for quick event setup

class CandidateTemplate {
  final String number;
  final String name;
  final String gender;

  CandidateTemplate({
    required this.number,
    required this.name,
    required this.gender,
  });

  Map<String, dynamic> toMap() => {
    'number': number,
    'name': name,
    'gender': gender,
    'department': '',
  };
}

class CategoryTemplate {
  final String name;
  final String description;

  CategoryTemplate({
    required this.name,
    required this.description,
  });

  Map<String, String> toMap() => {
    'name': name,
    'description': description,
  };
}

class CriteriaTemplate {
  final String name;
  final int maxScore;
  final double percentage;
  final String description;

  CriteriaTemplate({
    required this.name,
    this.maxScore = 100,
    this.percentage = 0,
    this.description = '',
  });

  Map<String, dynamic> toMap() => {
    'name': name,
    'max_score': maxScore,
    'percentage': percentage,
    'description': description,
  };
}

// Sample Templates
class TemplateLibrary {
  // Candidate Templates
  static List<CandidateTemplate> sampleCandidates = [
    CandidateTemplate(number: '1', name: 'Candidate 1', gender: 'Female'),
    CandidateTemplate(number: '2', name: 'Candidate 2', gender: 'Female'),
    CandidateTemplate(number: '3', name: 'Candidate 3', gender: 'Female'),
  ];

  static List<CandidateTemplate> maleCandidates = [
    CandidateTemplate(number: '1', name: 'Candidate 1', gender: 'Male'),
    CandidateTemplate(number: '2', name: 'Candidate 2', gender: 'Male'),
    CandidateTemplate(number: '3', name: 'Candidate 3', gender: 'Male'),
  ];

  // Solo Contest Candidates (no gender separation)
  static List<CandidateTemplate> soloCandidates = [
    CandidateTemplate(number: '1', name: 'Participant 1', gender: 'Solo'),
    CandidateTemplate(number: '2', name: 'Participant 2', gender: 'Solo'),
    CandidateTemplate(number: '3', name: 'Participant 3', gender: 'Solo'),
    CandidateTemplate(number: '4', name: 'Participant 4', gender: 'Solo'),
    CandidateTemplate(number: '5', name: 'Participant 5', gender: 'Solo'),
  ];

  // Group/Team Contest Candidates
  static List<CandidateTemplate> groupCandidates = [
    CandidateTemplate(number: '1', name: 'Team Alpha', gender: 'Group'),
    CandidateTemplate(number: '2', name: 'Team Bravo', gender: 'Group'),
    CandidateTemplate(number: '3', name: 'Team Charlie', gender: 'Group'),
    CandidateTemplate(number: '4', name: 'Team Delta', gender: 'Group'),
  ];

  // Category Templates
  static List<CategoryTemplate> pageantCategories = [
    CategoryTemplate(name: 'Swimwear', description: 'Swimwear Competition'),
    CategoryTemplate(name: 'Evening Gown', description: 'Evening Gown Competition'),
    CategoryTemplate(name: 'Talent', description: 'Talent Showcase'),
  ];

  static List<CategoryTemplate> talentShowCategories = [
    CategoryTemplate(name: 'Singing', description: 'Singing Performance'),
    CategoryTemplate(name: 'Dancing', description: 'Dance Performance'),
    CategoryTemplate(name: 'Comedy', description: 'Comedy Act'),
  ];

  // Solo Contest Categories (e.g., Singing Contest)
  static List<CategoryTemplate> soloContestCategories = [
    CategoryTemplate(name: 'Elimination Round', description: 'Initial round'),
    CategoryTemplate(name: 'Semi-Finals', description: 'Semi-final round'),
    CategoryTemplate(name: 'Grand Finals', description: 'Final round'),
  ];

  // Group Contest Categories (e.g., Battle of the Bands)
  static List<CategoryTemplate> groupContestCategories = [
    CategoryTemplate(name: 'Preliminary Round', description: 'Initial performance'),
    CategoryTemplate(name: 'Finals', description: 'Final showdown'),
  ];

  // Criteria Templates
  static List<CriteriaTemplate> standardCriteria = [
    CriteriaTemplate(name: 'Appearance', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Confidence', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Talent', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Overall Impression', maxScore: 100, percentage: 25),
  ];

  static List<CriteriaTemplate> pageantCriteria = [
    CriteriaTemplate(name: 'Physical Appearance', maxScore: 100, percentage: 30),
    CriteriaTemplate(name: 'Poise & Bearing', maxScore: 100, percentage: 20),
    CriteriaTemplate(name: 'Communication Skills', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Personality', maxScore: 100, percentage: 25),
  ];

  static List<CriteriaTemplate> talentCriteria = [
    CriteriaTemplate(name: 'Technical Skill', maxScore: 100, percentage: 30),
    CriteriaTemplate(name: 'Creativity', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Stage Presence', maxScore: 100, percentage: 25),
    CriteriaTemplate(name: 'Entertainment Value', maxScore: 100, percentage: 20),
  ];

  // Solo Contest Criteria (e.g., Singing Contest)
  static List<CriteriaTemplate> soloContestCriteria = [
    CriteriaTemplate(name: 'Voice Quality', maxScore: 30, percentage: 30),
    CriteriaTemplate(name: 'Pitch & Tone', maxScore: 25, percentage: 25),
    CriteriaTemplate(name: 'Stage Presence', maxScore: 20, percentage: 20),
    CriteriaTemplate(name: 'Song Interpretation', maxScore: 25, percentage: 25),
  ];

  // Group Contest Criteria (e.g., Battle of the Bands)
  static List<CriteriaTemplate> groupContestCriteria = [
    CriteriaTemplate(name: 'Musical Talent', maxScore: 30, percentage: 30),
    CriteriaTemplate(name: 'Originality', maxScore: 25, percentage: 25),
    CriteriaTemplate(name: 'Stage Presence', maxScore: 20, percentage: 20),
    CriteriaTemplate(name: 'Audience Impact', maxScore: 25, percentage: 25),
  ];
}
