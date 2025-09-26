# Mobile zkETHer + Mopro Integration Revamp Plan

## Current State Analysis

### ✅ What We Have
- **Frontend**: Complete CircomProofScreen UI with zkETHer styling
- **Mopro Module**: Copied from react-native-app with TypeScript bindings
- **Circuit Assets**: `multiplier2_final.zkey` proving key
- **Project Structure**: Existing mobile zkETHer app with onboarding flow

### ❌ What's Missing
- **Native Bindings**: Android mopro native libraries not built
- **Circuit Integration**: No connection between UI and actual proving
- **Build Pipeline**: No automated circuit compilation workflow
- **Dependencies**: Mopro not properly integrated as dependency

## Integration Strategy: Hybrid Approach

**Recommendation**: Use **Module Integration** approach rather than `mopro init` for better control and existing codebase preservation.

### Why This Approach?
1. **Preserve Existing Work**: Keep your zkETHer app structure, styling, and features
2. **Selective Integration**: Only add mopro proving capabilities without restructuring
3. **Gradual Migration**: Can test and iterate without breaking existing functionality
4. **Custom Circuits**: Easier to add your own circuits later

## Phase 1: Core Mopro Integration (Android Only)

### 1.1 Dependencies & Configuration
```bash
# Add mopro as local module dependency
# Update package.json with expo-modules-core
# Configure metro.config.js for local modules
```

### 1.2 Native Android Setup
```bash
# Copy Android native bindings from working mopro project
# Update android/settings.gradle
# Configure android/app/build.gradle
# Add required NDK/Rust toolchain setup
```

### 1.3 Circuit Assets Management
```
assets/
├── circuits/
│   ├── multiplier2/
│   │   ├── multiplier2_final.zkey
│   │   ├── multiplier2.wasm (if needed)
│   │   └── circuit.json (metadata)
│   └── future-circuits/
└── keys/ (existing)
```

## Phase 2: Proof Generation Integration

### 2.1 Service Layer
```typescript
// src/services/moproService.ts
- Wrapper around mopro module
- Circuit loading and caching
- Proof generation with error handling
- Verification logic
```

### 2.2 Update CircomProofScreen
```typescript
// Replace mock functionality with real mopro calls
- generateCircomProof() -> actual proving
- verifyCircomProof() -> actual verification  
- Loading states and error handling
- Progress indicators for proof generation
```

## Phase 3: Build Pipeline & Custom Circuits

### 3.1 Circuit Development Workflow
```
circom/
├── src/
│   ├── multiplier.circom
│   └── future-circuits.circom
├── build/
│   ├── compiled/
│   └── keys/
└── scripts/
    ├── compile.sh
    └── setup-keys.sh
```

### 3.2 Automated Build Process
```bash
# Script to compile circom -> r1cs -> zkey
# Copy artifacts to assets/circuits/
# Update circuit registry/metadata
```

## Phase 4: Advanced Features

### 4.1 zkETHer-Specific Circuits
- Commitment schemes
- Nullifier generation  
- Merkle tree proofs
- Range proofs for compliance

### 4.2 Performance Optimization
- Circuit caching strategies
- Background proof generation
- Proof batching for multiple operations

## Implementation Priority

### 🔥 High Priority (Week 1)
1. **Fix Native Bindings**: Get mopro Android module working
2. **Basic Proof Generation**: Connect UI to real proving
3. **Asset Management**: Proper circuit file handling

### 🟡 Medium Priority (Week 2)
1. **Error Handling**: Robust error states and recovery
2. **Performance**: Loading states and optimization
3. **Testing**: Verify proof generation works end-to-end

### 🟢 Low Priority (Future)
1. **Custom Circuits**: Build zkETHer-specific circuits
2. **Build Automation**: Streamlined circuit compilation
3. **Advanced Features**: Batching, caching, etc.

## Technical Decisions

### Module vs Package Approach
**✅ Chosen**: Local module in `modules/mopro/`
- **Pros**: Full control, easier debugging, custom modifications
- **Cons**: Manual updates, more setup complexity

### Circuit Compilation Strategy  
**✅ Chosen**: External compilation + asset copying
- **Pros**: Faster React Native builds, better separation
- **Cons**: Manual step, potential sync issues

### Android-First Development
**✅ Chosen**: Focus on Android only initially
- **Pros**: Simpler setup, faster iteration
- **Cons**: iOS support delayed

## Risk Mitigation

### 🚨 High Risk: Native Build Issues
- **Mitigation**: Use working react-native-app as reference
- **Fallback**: Mock implementation for development

### ⚠️ Medium Risk: Circuit Compatibility
- **Mitigation**: Start with proven multiplier circuit
- **Testing**: Verify proof/verification cycle works

### 💡 Low Risk: Performance Issues
- **Mitigation**: Profile and optimize incrementally
- **Monitoring**: Add timing metrics to proof generation

## Success Metrics

### Phase 1 Success
- [ ] Mopro module loads without errors
- [ ] Can call `hello()` function from mopro
- [ ] Android build completes successfully

### Phase 2 Success  
- [ ] Generate real proof for multiplication circuit
- [ ] Verify proof returns correct boolean
- [ ] UI shows actual proof data (not mocked)

### Phase 3 Success
- [ ] Can compile custom circom circuit
- [ ] Generated artifacts work in mobile app
- [ ] End-to-end workflow documented

## Next Steps

1. **Start with Phase 1.1**: Update package.json and dependencies
2. **Copy Native Bindings**: From react-native-app to main project
3. **Test Basic Integration**: Verify mopro module loads
4. **Connect to UI**: Replace mock functions with real calls

---

**Estimated Timeline**: 2-3 weeks for full integration
**Primary Focus**: Android-only, multiplication circuit, solid foundation for future zkETHer circuits
