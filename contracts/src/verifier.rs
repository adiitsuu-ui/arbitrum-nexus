//! High-performance mathematical verifier for AI model outputs & vector embeddings.
//! Designed for Arbitrum Stylus (WASM execution).

/// Fixed-point scaling factor (e.g. 1.0 = 10,000 basis points)
pub const BPS_SCALE: i128 = 10_000;

/// Computes the cosine similarity between two i32 vector embeddings.
/// Returns the similarity score in basis points: [0, 10_000] (0% to 100%).
/// Returns 0 if dimensions mismatch or either vector is zero-magnitude.
pub fn compute_cosine_similarity_bps(vec_a: &[i32], vec_b: &[i32]) -> u32 {
    if vec_a.is_empty() || vec_a.len() != vec_b.len() {
        return 0;
    }

    let mut dot_product: i128 = 0;
    let mut norm_a_sq: i128 = 0;
    let mut norm_b_sq: i128 = 0;

    for (a, b) in vec_a.iter().zip(vec_b.iter()) {
        let val_a = *a as i128;
        let val_b = *b as i128;

        dot_product += val_a * val_b;
        norm_a_sq += val_a * val_a;
        norm_b_sq += val_b * val_b;
    }

    if norm_a_sq <= 0 || norm_b_sq <= 0 || dot_product <= 0 {
        return 0;
    }

    // norm_product = sqrt(norm_a_sq) * sqrt(norm_b_sq)
    // Avoids u128 overflow when multiplying large square norms
    let norm_a = integer_sqrt(norm_a_sq as u128);
    let norm_b = integer_sqrt(norm_b_sq as u128);
    let norm_product = (norm_a as i128) * (norm_b as i128);

    if norm_product == 0 {
        return 0;
    }

    let similarity_scaled = (dot_product * BPS_SCALE) / norm_product;
    if similarity_scaled > BPS_SCALE {
        BPS_SCALE as u32
    } else {
        similarity_scaled as u32
    }
}

/// Integer square root using Newton-Raphson approximation (WASM-friendly, no floats needed)
pub fn integer_sqrt(val: u128) -> u128 {
    if val == 0 {
        return 0;
    }
    // Fast initial bit-shift guess
    let shift = (128 - val.leading_zeros()).div_ceil(2);
    let mut x0 = 1u128 << shift;
    let mut x1 = (x0 + val / x0) / 2;
    while x1 < x0 {
        x0 = x1;
        x1 = (x0 + val / x0) / 2;
    }
    x0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_identical_vectors() {
        let v1 = vec![1000, 2000, 3000, 4000];
        let v2 = vec![1000, 2000, 3000, 4000];
        let score = compute_cosine_similarity_bps(&v1, &v2);
        assert_eq!(score, 10_000); // 100% similarity
    }

    #[test]
    fn test_orthogonal_vectors() {
        let v1 = vec![1000, 0, 0, 0];
        let v2 = vec![0, 1000, 0, 0];
        let score = compute_cosine_similarity_bps(&v1, &v2);
        assert_eq!(score, 0); // 0% similarity
    }

    #[test]
    fn test_high_similarity() {
        // v1 and v2 pointing closely in same direction
        let v1 = vec![1000, 1000, 1000, 1000];
        let v2 = vec![990, 1010, 1005, 995];
        let score = compute_cosine_similarity_bps(&v1, &v2);
        assert!(score >= 9990 && score <= 10000);
    }

    #[test]
    fn test_large_vector_no_overflow() {
        let dim = 1536;
        let v1 = vec![1_000_000i32; dim];
        let v2 = vec![1_000_000i32; dim];
        let score = compute_cosine_similarity_bps(&v1, &v2);
        assert_eq!(score, 10_000);
    }

    #[test]
    fn test_negative_components() {
        let v1 = vec![-1000, 2000, -3000, 4000];
        let v2 = vec![-1000, 2000, -3000, 4000];
        let score = compute_cosine_similarity_bps(&v1, &v2);
        assert_eq!(score, 10_000);
    }
}
