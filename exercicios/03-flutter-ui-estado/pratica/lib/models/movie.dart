// lib/models/movie.dart — modelo de domínio.
//
// TASK 12 (🧑‍💻 EM CASA · fácil): implemente toJson() e Movie.fromJson().
// O cache offline guarda cada filme como JSON — sem isso nada é salvo.

class Movie {
  final int id;
  final String title;
  final double rating;
  final String year;
  final String? posterPath; // só vem preenchido com dados reais do TMDB (opcional)

  const Movie({
    required this.id,
    required this.title,
    required this.rating,
    required this.year,
    this.posterPath,
  });

  // ── TASK 12 — serialização · fácil ───────────────────────────────────────────────
  // toJson: devolva {'id': ..., 'title': ..., 'rating': ..., 'year': ...}
  // fromJson: faça o caminho de volta. Dica: `(json['rating'] as num).toDouble()`
  // (o JSON pode trazer 8 em vez de 8.0).
  // Extra (opcional): se `posterPath != null`, inclua também 'posterPath' no toJson e leia no
  // fromJson (`json['posterPath'] as String?`) — assim o pôster dos dados reais sobrevive offline.
  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'rating': rating,
        'year': year,
        if (posterPath != null) 'posterPath': posterPath, // só quando existe (dados reais)
      };

  factory Movie.fromJson(Map<String, dynamic> json) => Movie(
        id: json['id'] as int,
        title: json['title'] as String,
        rating: (json['rating'] as num).toDouble(), // aceita 8 ou 8.0
        year: json['year'] as String,
        posterPath: json['posterPath'] as String?,
      );
}
