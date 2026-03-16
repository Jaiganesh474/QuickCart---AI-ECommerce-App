class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? mobileNumber;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.mobileNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'USER',
      mobileNumber: json['mobileNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'mobileNumber': mobileNumber,
    };
  }
}
