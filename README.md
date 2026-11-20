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
├── config/         configuração do relógio usado no resumo mensal
├── dto/            resposta do resumo mensal
├── service/        SummaryService   (cálculo da presença e da meta)
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
├── components/     Button, Input, AttendanceProgress
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

### 2. Configurar o endereço da API

Com o backend rodando no mesmo computador, o app já usa `http://localhost:8080` no simulador iOS e no navegador, e `http://10.0.2.2:8080` no emulador Android do Android Studio.

No **celular físico**, `localhost` aponta para o próprio celular. Descubra o IP do computador na rede Wi-Fi (`ipconfig` no Windows) e crie `mobile/.env.local` com o endereço correto:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.3:8080
```

O IP acima é um exemplo: substitua pelo IP atual do seu computador. `EXPO_PUBLIC_API_URL` tem prioridade sobre os endereços padrão. Após alterar essa configuração, reinicie o Expo e recarregue o app.

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go. O celular e o computador precisam estar na mesma rede Wi-Fi.

Se estiver usando o **simulador iOS no mesmo Mac que roda o backend**, você pode iniciar o Expo apontando para a API local:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 npx expo start
```

Esse endereço é para o simulador; no celular físico, use o IP do computador na rede Wi-Fi.

### Navegação entre as telas

- Sem sessão salva, o app abre no **Login**. O link “Não tem conta? Cadastre-se” abre o **Cadastro**.
- Após entrar ou criar uma conta, aparecem as abas **Início (Dashboard)**, **Calendário**, **Histórico** e **Perfil**.
- O Dashboard mostra os registros do mês e a **presença já realizada**, com uma barra de 0% a 100%, um marcador da meta e quantos dias faltam para alcançá-la. O botão **Registrar presença** abre um novo registro.
- O progresso é atualizado ao voltar ao Dashboard após criar, editar ou excluir registros e após alterar a meta no Perfil.
- No Calendário, toque em uma data para registrar ou editar a presença. No Histórico, toque em um registro para editá-lo.
- Ao salvar ou voltar, o app retorna à tela anterior. No Perfil, **Sair** retorna ao Login.

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
| GET | `/summary?month=2026-11` | Presença realizada e progresso da meta do mês, para o usuário autenticado |
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

### Cálculo da presença e da meta (`SummaryService`)

```
dias considerados = segundas a sextas do mês - folgas nesses dias
presenças          = dias de escritório em dias úteis, até hoje
necessários        = dias considerados x meta / 100 (arredondado para cima)
porcentagem        = presenças / dias considerados x 100
faltam             = máximo entre (necessários - presenças) e zero
```

O denominador considera o mês inteiro. Presenças futuras e registros de fim de semana não contam como presença realizada. Folgas em dias úteis, inclusive futuras, reduzem os dias considerados para a meta mensal. Feriados não são descontados automaticamente.

O backend usa o fuso `America/Sao_Paulo` para determinar a data de hoje; ele pode ser alterado com a propriedade `app.time-zone`. O percentual é apresentado com até uma casa decimal. A meta é atingida pela quantidade de dias necessários, sem depender do arredondamento do percentual.

Exemplo: 20 dias considerados, meta de 60% e 6 presenças resultam em **30% de presença**, **6 de 12 dias necessários** e **6 dias restantes**. A barra mostra 30% de preenchimento, com a meta marcada em 60%. Já um mês com 21 dias considerados exige `ceil(21 × 60 / 100) = 13` presenças.

A rota `GET /summary?month=YYYY-MM` exige autenticação e um mês válido. Exemplo de resposta:

```json
{
  "month": "2026-11",
  "referenceDate": "2026-11-20",
  "eligibleDays": 20,
  "officeDays": 6,
  "requiredDays": 12,
  "remainingDays": 6,
  "attendancePercent": 30.0,
  "targetPercent": 60,
  "targetReached": false
}
```

Se todos os dias úteis forem folgas, `attendancePercent` será `null`, os dias necessários/restantes serão zero e `targetReached` será `false`. Nesse caso, o Dashboard mostra “Sem dias úteis considerados neste mês”, sem barra ou mensagem de meta alcançada.

### Validar as alterações

No backend, execute `./mvnw test` para validar os cálculos, a autenticação e o isolamento dos resumos entre usuários. Os testes usam banco H2 em memória e datas controladas, sem alterar o banco local do aplicativo.

No mobile, execute `npx tsc --noEmit` para validar os tipos. No simulador, confira o progresso após salvar, editar e excluir uma presença e depois de alterar a meta no Perfil.

---

## Tecnologias

- **Mobile:** React Native (Expo), TypeScript, React Navigation, Axios, AsyncStorage, Context API.
- **Backend:** Java 17, Spring Boot 3 (Web, Data JPA, Security), JJWT, banco H2.
