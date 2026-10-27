
"""Small, local TF-IDF retrieval index; no API key or model server required."""

from __future__ import annotations

from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class RetrievalIndex:
    def __init__(self) -> None:
        self.items: list[dict[str, Any]] = []
        self.vectorizer: TfidfVectorizer | None = None
        self.matrix = None

    def rebuild(self, items: list[dict[str, Any]]) -> None:
        """Build the search index from document passages."""
        self.items = []
        self.vectorizer = None
        self.matrix = None

        # Ignore empty passages.
        valid_items = [
            item
            for item in items
            if isinstance(item.get("text"), str) and item["text"].strip()
        ]

        if not valid_items:
            return

        vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )

        try:
            matrix = vectorizer.fit_transform(
                [item["text"] for item in valid_items]
            )
        except ValueError:
            # Happens when passages contain no usable text.
            return

        self.items = valid_items
        self.vectorizer = vectorizer
        self.matrix = matrix

    def search(
        self,
        question: str,
        top_k: int = 4,
        threshold: float = 0.0,
    ) -> list[dict[str, Any]]:
        """Return the most relevant document passages for a question."""
        if (
            self.vectorizer is None
            or self.matrix is None
            or not isinstance(question, str)
            or not question.strip()
            or top_k <= 0
        ):
            return []

        query = self.vectorizer.transform([question.strip()])

        # No vocabulary terms from the question matched the documents.
        if query.nnz == 0:
            return []

        scores = cosine_similarity(query, self.matrix).ravel()
        ranked = scores.argsort()[::-1]

        results: list[dict[str, Any]] = []

        for index in ranked:
            score = float(scores[index])

            if score <= threshold:
                continue

            item = self.items[int(index)]

            results.append(
                {
                    "filename": item.get("filename", "Unknown"),
                    "page": item.get("page"),
                    "section": item.get("section", "Document"),
                    "excerpt": item["text"][:520],
                    "score": round(score, 3),
                }
            )

            if len(results) >= top_k:
                break

        return results
