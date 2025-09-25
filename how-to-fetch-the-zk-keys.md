# How to Fetch zkETHer Keys

This document explains how to retrieve the cryptographically secure keys generated during the onboarding process for the zkETHer protocol.

## 🔐 Key Architecture

The zkETHer mobile app generates and stores keys locally on the device using Android Keystore for hardware-backed security. Keys are **never transmitted over the network** and remain on the user's device.

### Key Components:
- **Private Key**: 256-bit cryptographically secure key (requires biometric/PIN authentication)
- **Public Key**: Derived public key for verification operations
- **Key ID**: Unique identifier for the key pair
- **OnchainID**: Associated blockchain identity from KYC verification

## 📱 Client-Side API Endpoints

Since keys are stored locally, you interact with them through the `secureKeyService` methods:

### Import the Service
```typescript
import { secureKeyService } from '../services/secureKeyService';
```

### 1. Check if User Has Keys
```typescript
// Endpoint: hasKeys()
const hasKeys = await secureKeyService.hasKeys();
console.log('User has keys:', hasKeys); // boolean
```

### 2. Get Public Key (No Authentication Required)
```typescript
// Endpoint: getPublicKey()
const publicKey = await secureKeyService.getPublicKey();
console.log('Public Key:', publicKey); // "0x1234567890abcdef..."
```

### 3. Get Private Key (Requires Biometric/PIN Authentication)
```typescript
// Endpoint: getPrivateKey()
// This will prompt user for biometric authentication
const privateKey = await secureKeyService.getPrivateKey();
console.log('Private Key:', privateKey); // "0xabcdef1234567890..." or null if auth failed
```

### 4. Get Key Information (Metadata Only)
```typescript
// Endpoint: getKeyInfo()
const keyInfo = await secureKeyService.getKeyInfo();
console.log('Key Info:', keyInfo);
// Returns:
// {
//   keyId: "a1b2c3d4e5f6...",
//   publicKey: "0x1234567890abcdef...",
//   createdAt: "2024-01-15T10:30:00.000Z",
//   onchainId: "0x98011432..."
// }
```

### 5. Generate New Keys (During Onboarding)
```typescript
// Endpoint: generateAndStoreKeys(onchainId?)
const keyInfo = await secureKeyService.generateAndStoreKeys(onchainId);
console.log('Generated Keys:', keyInfo);
```

## 🔒 Security Features

### Authentication Requirements:
- **Public Key**: No authentication required
- **Private Key**: Requires biometric (fingerprint/face) or device PIN
- **Key Metadata**: No authentication required

### Storage Security:
- **Android Keystore**: Hardware-backed security when available
- **Encryption**: Keys encrypted at rest
- **Device Binding**: Keys tied to specific device
- **Tamper Detection**: Hardware-level protection against extraction

## 💡 Usage Examples

### Example 1: Check if User Needs to Generate Keys
```typescript
async function checkUserKeyStatus() {
  const hasKeys = await secureKeyService.hasKeys();
  
  if (!hasKeys) {
    console.log('User needs to generate keys during onboarding');
    // Redirect to onboarding flow
  } else {
    const keyInfo = await secureKeyService.getKeyInfo();
    console.log('User has keys:', keyInfo.keyId);
  }
}
```

### Example 2: Get Keys for Zero-Knowledge Proof
```typescript
async function getKeysForZKProof() {
  try {
    // Get public key (no auth required)
    const publicKey = await secureKeyService.getPublicKey();
    
    // Get private key (requires biometric auth)
    const privateKey = await secureKeyService.getPrivateKey();
    
    if (publicKey && privateKey) {
      // Use keys for ZK proof generation
      return { publicKey, privateKey };
    } else {
      throw new Error('Failed to retrieve keys');
    }
  } catch (error) {
    console.error('Authentication failed or keys not found:', error);
    return null;
  }
}
```

### Example 3: Display Key Information to User
```typescript
async function displayUserKeyInfo() {
  const keyInfo = await secureKeyService.getKeyInfo();
  
  if (keyInfo) {
    return {
      keyId: keyInfo.keyId,
      publicKey: keyInfo.publicKey,
      createdAt: new Date(keyInfo.createdAt).toLocaleDateString(),
      onchainId: keyInfo.onchainId,
      // Never display private key in UI
    };
  }
  
  return null;
}
```

## 🚨 Security Best Practices

### DO:
- ✅ Always check if keys exist before attempting operations
- ✅ Handle authentication failures gracefully
- ✅ Use public key for verification operations
- ✅ Only access private key when absolutely necessary
- ✅ Implement proper error handling for key operations

### DON'T:
- ❌ Never transmit private keys over the network
- ❌ Never log private keys to console in production
- ❌ Never store private keys in plain text
- ❌ Never bypass biometric authentication requirements
- ❌ Never display private keys in the UI

## 🔄 Key Lifecycle

1. **Generation**: During onboarding after KYC verification
2. **Storage**: Immediately stored in Android Keystore
3. **Usage**: Retrieved as needed for ZK operations
4. **Rotation**: Keys persist for the lifetime of the app installation
5. **Deletion**: Only when user explicitly resets or uninstalls app

## 📊 Error Handling

### Common Error Scenarios:
```typescript
try {
  const privateKey = await secureKeyService.getPrivateKey();
} catch (error) {
  if (error.message.includes('authentication')) {
    // User cancelled biometric prompt
    console.log('Authentication required');
  } else if (error.message.includes('not found')) {
    // Keys don't exist, redirect to onboarding
    console.log('Keys not found, generate new keys');
  } else {
    // Other security or system errors
    console.error('Key retrieval failed:', error);
  }
}
```

## 🔧 Integration with zkETHer Protocol

### For Merkle Tree Operations:
```typescript
async function proveNoteOwnership(noteCommitment: string) {
  const keys = await getKeysForZKProof();
  if (!keys) return null;
  
  // Use private key to generate proof of note ownership
  // Use public key for verification
  return generateZKProof(keys.privateKey, keys.publicKey, noteCommitment);
}
```

### For Transaction Signing:
```typescript
async function signZKTransaction(transactionData: any) {
  const privateKey = await secureKeyService.getPrivateKey();
  if (!privateKey) throw new Error('Private key not accessible');
  
  // Sign transaction with private key
  return signTransaction(privateKey, transactionData);
}
```

---

## 📞 Support

For technical issues with key generation or retrieval:
1. Check device biometric settings
2. Verify app permissions for secure storage
3. Ensure device has hardware security features enabled
4. Contact support if keys are lost or corrupted

**Remember**: Keys are device-specific and cannot be recovered if lost. Users should be informed about this during onboarding.
