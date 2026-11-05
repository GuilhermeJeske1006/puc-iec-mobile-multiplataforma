package org.example.project

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.example.project.data.Movie
import org.example.project.data.TmdbApi
import kotlin.math.roundToInt

// ─────────────────────────────────────────────────────────────────────────────
// App — Composable raiz compartilhado entre Android, iOS e Web.
//
// A busca de dados (TmdbApi) já está pronta — o exercício é construir a UI.
// tmdbToken vem do BuildKonfig.TMDB_TOKEN (gerado do local.properties pra todas as plataformas).
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun App(tmdbToken: String = "") {
    MaterialTheme {
        var movies by remember { mutableStateOf<List<Movie>>(emptyList()) }
        var isLoading by remember { mutableStateOf(false) }
        var error by remember { mutableStateOf<String?>(null) }

        val api = remember(tmdbToken) { TmdbApi(tmdbToken) }

        LaunchedEffect(Unit) {
            if (tmdbToken.isBlank()) return@LaunchedEffect
            isLoading = true
            try {
                movies = api.popularMovies().results
            } catch (e: Exception) {
                error = e.message ?: "Erro desconhecido"
            } finally {
                isLoading = false
            }
        }

        Surface(modifier = Modifier.fillMaxSize()) {
            // TODO 1 — a ordem dos ramos importa: o primeiro que casar vence.
            when {
                tmdbToken.isBlank() -> TokenMissingMessage()
                isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                error != null -> ErrorMessage(error!!)
                else -> MovieList(movies)
            }
        }
    }
}

@Composable
private fun MovieList(movies: List<Movie>) {
    if (movies.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Nenhum filme encontrado.")
        }
        return
    }

    // TODO 2 — lista rolável: cabeçalho + um MovieCard por filme.
    // O app é edge-to-edge (enableEdgeToEdge no Android, notch no iOS): somamos as
    // insets do sistema aos 16dp pra o cabeçalho não ficar embaixo da status bar.
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = WindowInsets.safeDrawing
            .add(WindowInsets(left = 16.dp, top = 16.dp, right = 16.dp, bottom = 16.dp))
            .asPaddingValues(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                text = "${movies.size} filmes populares",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
        }
        // Sem `key = { it.id }` de propósito: se a API repetir um id, chave duplicada
        // derruba o LazyColumn (IllegalArgumentException) — sem key só repete o card.
        items(movies) { movie -> MovieCard(movie) }
    }
}

@Composable
private fun MovieCard(movie: Movie) {
    // TODO 3 — Card > Row: poster placeholder (Box) à esquerda, textos (Column) à direita.
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.padding(12.dp)) {
            Box(
                modifier = Modifier
                    .size(width = 56.dp, height = 84.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = titleInitial(movie.title),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = movie.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = movie.overview.ifBlank { "Sinopse indisponível." },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(8.dp))
                Row {
                    Text("⭐ ${formatRating(movie.voteAverage)}", style = MaterialTheme.typography.labelLarge)
                    val year = movie.releaseDate.take(4)
                    if (year.isNotBlank()) {
                        Text(
                            text = " · $year",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

// Inicial do título pro placeholder do poster. Pula aspas/pontuação ("'71" → "7")
// e não quebra com título vazio (String.first() lançaria NoSuchElementException).
private fun titleInitial(title: String): String =
    title.firstOrNull { it.isLetterOrDigit() }?.uppercase() ?: "?"

// Nota com 1 casa decimal ("8.7"). String.format é JVM-only — não existe em commonMain.
// vote_average ausente vira 0.0 no Movie.kt: mostra "sem nota" em vez de um 0.0 enganoso.
private fun formatRating(vote: Double): String {
    if (vote.isNaN() || vote <= 0.0) return "sem nota"
    val tenths = (vote.coerceAtMost(10.0) * 10).roundToInt()
    return "${tenths / 10}.${tenths % 10}"
}

@Composable
private fun TokenMissingMessage() {
    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Token TMDB não configurado", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(Modifier.height(8.dp))
            Text(
                "Adicione tmdb.token=<seu-token> em local.properties e sincronize o Gradle.",
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

@Composable
private fun ErrorMessage(msg: String) {
    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Text("Erro: $msg", color = MaterialTheme.colorScheme.error)
    }
}

// ── Previews (Android Studio → Split) — veem a UI sem emulador nem token ─────

private val previewMovies = listOf(
    Movie(1, "Matrix", "Um hacker descobre a verdade sobre a realidade e entra na guerra contra as máquinas.", null, "1999-03-31", 8.7),
    Movie(2, "Interestelar", "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço.", null, "2014-11-05", 8.4),
    Movie(3, "Filme sem sinopse", "", null, "", 0.0),
)

@Preview
@Composable
private fun MovieCardPreview() {
    MaterialTheme { MovieCard(previewMovies.first()) }
}

@Preview
@Composable
private fun MovieListPreview() {
    MaterialTheme { Surface { MovieList(previewMovies) } }
}
