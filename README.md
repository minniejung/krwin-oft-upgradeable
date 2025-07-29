# KRWIN Cross-Chain Token

LayerZero를 사용한 업그레이드 가능한 크로스체인 토큰 프로젝트입니다.

## 🚀 빠른 시작

### 설치

```bash
npm install
```

### 환경 설정

```bash
cp .env.example .env
# .env 파일에 PRIVATE_KEY 설정
```

### 컴파일

```bash
npm run compile
```

## 🏗️ 주요 기능

- **크로스체인 전송**: LayerZero를 통한 다중 체인 토큰 전송
- **업그레이드 가능**: OpenZeppelin 업그레이드 패턴 사용
- **수수료 관리**: FeeManager를 통한 유연한 수수료 설정
- **보안 기능**: 블랙리스트, 동결, 전송 제한 등

## 📁 프로젝트 구조

├── contracts/ # 스마트 컨트랙트
│ ├── KRWIN.sol # 메인 토큰 컨트랙트
│ ├── FeeManager.sol # 수수료 관리자
│ └── modules/ # 기능 모듈들
├── deploy/ # 배포 스크립트
├── scripts/ # 유틸리티 스크립트
├── tasks/ # Hardhat 태스크들
├── test/ # 테스트 파일
└── utils/ # 헬퍼 함수들

## 🚀 배포

### 테스트넷 배포

```bash
# Sepolia 배포
npm run deploy:sepolia

# Base 배포
npm run deploy:base

# Fuji 배포
npm run deploy:fuji
```

### 메시징 활성화

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

## 📚 문서

- [LayerZero 문서](https://docs.layerzero.network/)
- [OFT 표준](https://docs.layerzero.network/v2/concepts/applications/oft-standard)
- [OApp 표준](https://docs.layerzero.network/v2/concepts/applications/oapp-standard)

## 📄 라이선스

MIT
