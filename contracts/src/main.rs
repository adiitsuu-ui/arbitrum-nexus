#![cfg_attr(not(feature = "export-abi"), no_main)]

#[cfg(feature = "export-abi")]
fn main() {
    stylus_sdk::abi::export::handle_license_and_pragma();
    stylus_sdk::abi::export::print_from_args::<stylus_nexus_contracts::StylusNexus>();
}
