# DBMS Educational Documentation: Data Lifecycle & Normalization

This document explains the technical implementation of the Data Import module, specifically how it handles complex relational mapping and ensures data integrity.

## 1. Data Decomposition (The ETL Process)

When a "Flat" CSV record is uploaded, the system performs a multi-step **Decomposition** to transform it from a single row into a 3rd Normal Form (3NF) relational structure.

### From One Row to Many Tables:
A single record like:
`"Quantum Computing", "Dr. Smith", "MIT", "NSF", 2024`

Is divided into the following entities:

1.  **`journals`**: The journal name and publisher are extracted. If the journal already exists (lookup by name), we retrieve its `journal_id`. If not, we create a new unique record. This eliminates redundant publisher strings.
2.  **`authors`**: Researcher profiles are isolated. We use `ORCID` as a unique identifier to prevent duplicate entries for the same person across different papers.
3.  **`papers`**: The core research object, which now uses a `journal_id` (Foreign Key) to link back to the Journals table instead of storing text.
4.  **`paper_funding`**: Financial metadata is linked to the `papers` table via a junction table, allowing a single paper to have multiple funding agencies if needed.

---

## 2. Normalization Strategy (3NF)

The system is designed to satisfy **Third Normal Form (3NF)** to ensure **Non-Redundancy**:

*   **Eliminating Functional Dependencies**: Attributes like `author_affiliation` or `journal_publisher` depend on the Author or Journal, NOT on the Paper title. By moving them to their own tables, we ensure that if an Author's affiliation changes, we only update it in **one place** (`authors` table) rather than in 100+ paper records.
*   **Preventing Insertion/Update Anomalies**: By using the `findOrCreate` pattern, we ensure that we don't end up with multiple slightly different versions of the same entity (e.g., "ACM Press" vs "A.C.M. Press").

---

## 3. Relational Integrity & Atomicity

To ensure the database never enters an inconsistent state (e.g., a paper exists but its authors failed to save), we implement **PostgreSQL Transactions**.

### The ACID Flow:
1.  **`BEGIN`**: Start a private transaction for the current CSV row.
2.  **Validation**: Check if all Foreign Key targets (Journals/Authors) exist or can be created.
3.  **Execution**: Insert into `papers`, then `paperauthors`, then `paper_funding`.
4.  **`COMMIT`**: If all steps succeed, the data is permanently written.
5.  **`ROLLBACK`**: If **any** step fails (e.g., a database constraint violation), the entire row's progress is discarded, keeping the database clean.

---

## 4. Entity Relationship Mapping

*   **Papers : Journals** (Many-to-One / `M:1`): Many papers belong to one journal.
*   **Papers : Authors** (Many-to-Many / `M:N`): One paper has many authors, and one author writes many papers. Managed via the `paperauthors` bridging table.
*   **Papers : Funding** (Many-to-Many / `M:N`): A paper can receive grants from multiple agencies. Managed via `paper_funding`.
