# Presença 60: controle de dias no escritório

Aplicativo mobile feito com **React Native (Expo + TypeScript)** no frontend e **Spring Boot** no backend.

## O problema

Muitas empresas usam o modelo híbrido e exigem que o funcionário vá ao escritório em uma porcentagem dos dias úteis do mês (por exemplo, **60%**). Fazer essa conta de cabeça é difícil.

## A solução

O usuário registra cada dia como **Escritório**, **Remoto** ou **Folga**, e o app mostra:
- a porcentagem de presença no mês;
- quantos dias ainda faltam para bater a meta.

A meta pode ser alterada no Perfil.

| Login | Cadastro | Dashboard | Calendário |
|---|---|---|---|
| ![](docs/screenshots/login.png) | ![](docs/screenshots/cadastro.png) | ![](docs/screenshots/dashboard.png) | ![](docs/screenshots/calendario.png) |

| Registrar presença | Histórico | Perfil |
|---|---|---|
| ![](docs/screenshots/registrar.png) | ![](docs/screenshots/historico.png) | ![](docs/screenshots/perfil.png) |

---

## Integrantes

Cada integrante fez uma funcionalidade completa: **a tela (frontend) e a rota da API (backend)**.

| Nome completo | RM | Funcionalidade | Frontend (React Native) | Backend (Spring Boot) |
|---|---|---|---|---|
| Carolina Magalhães Lopes | _RM00000_ | Login e Cadastro | `LoginScreen`, `RegisterScreen`, `AuthContext`, `storage.ts`, `api.ts` | `AuthController`, `security/` (JWT), `User`, `UserRepository` |
| Thiago Costa Marangoni | _RM00000_ | Dashboard e estrutura do projeto | `DashboardScreen`, `Routes.tsx`, `App.tsx`, componentes | `SummaryController` (cálculo da meta), configuração do projeto |
| Camila de Souza Chaves | _RM00000_ | Calendário | `CalendarScreen` | Rota `GET /attendances/month` |
| Carla Lima de Carvalho | _RM00000_ | Registrar presença | `RegisterAttendanceScreen`, `utils/date.ts` | `Attendance`, `AttendanceRepository`, rotas `POST`, `PUT`, `DELETE /attendances` |
| Tiphany Souza Vieira | _RM00000_ | Histórico e Perfil | `HistoryScreen`, `ProfileScreen` | `UserController`, rota `GET /attendances` |

---

## Requisitos da atividade

| Requisito | Onde está |
|---|---|
| Pelo menos 5 telas, incluindo login | 7 telas em `mobile/src/screens/` (uma pasta por tela) |
| Navegação e transição entre telas | `mobile/src/navigation/Routes.tsx`: Stack + Tabs, com animação |
| Autenticação JWT no Spring Boot | `backend/.../security/`: `TokenService`, `SecurityFilter`, `SecurityConfig` |
| API REST | `backend/.../controller/` e `mobile/src/services/api.ts` (Axios) |
| Gerenciamento de estado | `mobile/src/context/AuthContext.tsx` (Context API) |
| AsyncStorage | `mobile/src/storage/storage.ts`: guarda o token e o usuário |
| Banco relacional | H2 (SQL), com as tabelas `users` e `attendance` |
| Cadastro, consulta, atualização e exclusão | Registros de presença (`/attendances`) e conta do usuário (`/users/me`) |

---

## Estrutura

```
backend/src/main/java/br/com/fiap/presenca60/
├── model/          User, Attendance, AttendanceType   (tabelas do banco)
├── repository/     UserRepository, AttendanceRepository   (acesso ao banco)
├── security/       TokenService, SecurityFilter, SecurityConfig   (JWT)
└── controller/     AuthController, AttendanceController, UserController, SummaryController   (rotas da API)

mobile/src/
├── screens/        uma pasta para cada tela
│   ├── Login/                LoginScreen.tsx
│   ├── Register/             RegisterScreen.tsx
│   ├── Dashboard/            DashboardScreen.tsx
│   ├── Calendar/             CalendarScreen.tsx
│   ├── RegisterAttendance/   RegisterAttendanceScreen.tsx
│   ├── History/              HistoryScreen.tsx
│   └── Profile/              ProfileScreen.tsx
├── navigation/     Routes.tsx (Stack + Tabs)
├── context/        AuthContext.tsx (usuário logado)
├── services/       api.ts (Axios + token)
├── storage/        storage.ts (AsyncStorage)
├── components/     Button, Input
├── utils/          date.ts
├── theme.ts        cores
└── types.ts        tipos TypeScript
```

---

## Como executar

**Pré-requisitos:** Java 17+, Node.js 20+ e o app **Expo Go** no celular.

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd spring-boot:run`.

A API sobe em `http://localhost:8080` e o banco H2 é criado sozinho. Para ver as tabelas, abra `http://localhost:8080/h2-console` com JDBC URL `jdbc:h2:file:./data/presenca60`, usuário `sa` e senha vazia.

### 2. Configurar o IP da API

O celular não enxerga o `localhost` do computador. Descubra o IP do computador na rede Wi-Fi (`ipconfig` no Windows) e coloque em `mobile/src/services/api.ts`:

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.10:8080'; // <- seu IP
```

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go. O celular e o computador precisam estar na mesma rede Wi-Fi.

---

## Rotas da API

Todas, menos as de `/auth`, precisam do header `Authorization: Bearer <token>`.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/auth/register` | Cria conta e devolve `{ token, user }` |
| POST | `/auth/login` | Faz login e devolve `{ token, user }` |
| GET | `/attendances` | Lista os registros (Histórico) |
| GET | `/attendances/month?month=2026-11` | Registros do mês (Calendário) |
| POST | `/attendances` | Cria registro `{ date, type, note }` |
| PUT | `/attendances/{id}` | Edita registro |
| DELETE | `/attendances/{id}` | Exclui registro |
| GET | `/summary` | Cálculo da meta do mês (Dashboard) |
| GET / PUT / DELETE | `/users/me` | Ver, editar e excluir a conta (Perfil) |

---

## Como funciona (para a apresentação)

### Login com JWT

1. `LoginScreen` chama `signIn()` do `AuthContext`.
2. `signIn()` faz `POST /auth/login` com Axios.
3. O `AuthController` busca o usuário e confere a senha com **BCrypt**.
4. O `TokenService` gera o **token JWT** e devolve para o app.
5. O app salva token e usuário no **AsyncStorage** e faz `setUser(user)`.
6. O `Routes.tsx` vê que existe `user` e mostra as telas do app em vez do login.
7. A partir daí, o **interceptor** do `api.ts` manda o token em toda requisição.
8. No backend, o `SecurityFilter` lê o token e descobre quem é o usuário (`@AuthenticationPrincipal`).
9. Ao reabrir o app, o `AuthContext` encontra o usuário no AsyncStorage e já entra logado.

### CRUD de registros

- **Criar:** `RegisterAttendanceScreen` faz `api.post('/attendances', data)`.
- **Consultar:** `HistoryScreen` faz `api.get('/attendances')` e mostra numa `FlatList`.
- **Editar:** ao tocar num item, navegamos passando o registro: `navigation.navigate('RegisterAttendance', { record: item })`. Com `record`, a tela faz `api.put`.
- **Excluir:** botão Excluir faz `api.delete('/attendances/' + id)`.
- **Atualização das telas:** cada tela recarrega os dados com `useFocusEffect`, toda vez que aparece.

### Cálculo da meta (`SummaryController`)

```
dias úteis   = segundas a sextas do mês - folgas
necessários  = dias úteis x meta% (arredondado para cima)
porcentagem  = dias no escritório / dias úteis
faltam       = necessários - dias no escritório
```

Exemplo: novembro/2026 tem 21 dias úteis. 21 × 60% = 12,6, que arredonda para **13 dias** no escritório.

---

## Tecnologias

- **Mobile:** React Native (Expo), TypeScript, React Navigation, Axios, AsyncStorage, Context API.
- **Backend:** Java 17, Spring Boot 3 (Web, Data JPA, Security), JJWT, banco H2.
