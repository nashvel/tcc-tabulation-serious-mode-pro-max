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
}
