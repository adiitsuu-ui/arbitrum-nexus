//! WebAuthn / Passkey P-256 (secp256r1) verification module.
//! In standard EVM, P-256 verification is cost-prohibitive (~300,000+ gas).
//! In Arbitrum Stylus (Rust WASM), it executes in microseconds with negligible ink.

use p256::ecdsa::{signature::hazmat::PrehashVerifier, Signature, VerifyingKey};

/// Verifies a NIST P-256 (secp256r1) signature against a 32-byte message digest.
///
/// # Arguments
/// * `pubkey_bytes` - SEC1 encoded public key (33-byte compressed or 65-byte uncompressed).
/// * `msg_hash` - 32-byte hash of the authenticated data (e.g. SHA-256 of clientDataJSON + authData).
/// * `sig_bytes` - 64-byte raw signature (r || s) or ASN.1 DER encoded signature.
///
/// Returns `true` if the signature is mathematically valid, `false` otherwise.
pub fn verify_p256_signature(
    pubkey_bytes: &[u8],
    msg_hash: &[u8; 32],
    sig_bytes: &[u8],
) -> bool {
    // 1. Parse the SEC1 public key
    let Ok(verifying_key) = VerifyingKey::from_sec1_bytes(pubkey_bytes) else {
        return false;
    };

    // 2. Parse the ECDSA signature (supporting 64-byte raw r||s or DER)
    let signature = if sig_bytes.len() == 64 {
        let Ok(sig) = Signature::from_slice(sig_bytes) else {
            return false;
        };
        sig
    } else {
        let Ok(sig) = Signature::from_der(sig_bytes) else {
            return false;
        };
        sig
    };

    // 3. Verify signature against digest directly (prehash verification)
    verifying_key.verify_prehash(msg_hash, &signature).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use p256::ecdsa::signature::hazmat::PrehashSigner;
    use p256::ecdsa::SigningKey;
    use sha2::{Digest, Sha256};

    #[test]
    fn test_valid_passkey_signature() {
        // Generate test keypair
        let signing_key = SigningKey::random(&mut rand_core::OsRng);
        let verifying_key = signing_key.verifying_key();
        let encoded_point = verifying_key.to_encoded_point(false);
        let pubkey_bytes = encoded_point.as_bytes();

        let message = b"Arbitrum Stylus Passkey Test Message";
        let mut hasher = Sha256::new();
        hasher.update(message);
        let digest: [u8; 32] = hasher.finalize().into();

        let signature: Signature = signing_key.sign_prehash(&digest).unwrap();
        let sig_bytes = signature.to_bytes();

        assert!(verify_p256_signature(pubkey_bytes, &digest, &sig_bytes));
    }

    #[test]
    fn test_invalid_signature() {
        let signing_key = SigningKey::random(&mut rand_core::OsRng);
        let verifying_key = signing_key.verifying_key();
        let encoded_point = verifying_key.to_encoded_point(false);
        let pubkey_bytes = encoded_point.as_bytes();

        let digest = [0x42u8; 32];
        let mut wrong_sig = [0x01u8; 64];
        wrong_sig[0] = 0x12;

        assert!(!verify_p256_signature(pubkey_bytes, &digest, &wrong_sig));
    }

    #[test]
    fn test_der_encoded_signature() {
        let signing_key = SigningKey::random(&mut rand_core::OsRng);
        let verifying_key = signing_key.verifying_key();
        let encoded_point = verifying_key.to_encoded_point(false);
        let pubkey_bytes = encoded_point.as_bytes();

        let digest = [0x55u8; 32];
        let signature: Signature = signing_key.sign_prehash(&digest).unwrap();
        let der_sig = signature.to_der();

        assert!(verify_p256_signature(pubkey_bytes, &digest, der_sig.as_bytes()));
    }
}
