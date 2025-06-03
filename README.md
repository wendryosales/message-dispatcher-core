# 📦 Message Dispatcher

Sistema de disparo de mensagens assíncronas com suporte a múltiplos tipos (HTTP, Email) e mecanismo de retry com observabilidade integrada.

## Exemplo Prático

Imagine que você tem um sistema de pedidos, e sempre que um pedido é criado, você quer notificar um endpoint de outro sistema.

Você envia:

```bash
 POST /messages

 {
   "type": "http",
   "destination": "https://meu-client.com/webhook/pedidos",
   "payload": {
     "event": "order.created",
     "data": {
       "orderId": "abc123",
       "total": 199.90
     }
   }
 }
```

A API:

- Salva a mensagem no banco com status pending.
- Publica o ID no Kafka (message-dispatcher.http-messages).
- Um worker assíncrono consome a mensagem, tenta enviar o POST.
- Se falhar (ex: timeout), ele tenta novamente até 3 vezes com delay.
- Ao final, a mensagem é marcada como success ou failed.

## 🚀 Setup

### ✅ Pré-requisitos

- Docker + Docker Compose

### ⚙️ Instalação

1. Clone o repositório

   ```bash
   git clone git@github.com:wendryosales/message-dispatcher-core.git
   cd message-dispatcher-core
   ```

2. Inicie os containers

   ```bash
   docker-compose up -d
   ```

3. A aplicação estará disponível em:
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api
   - Prometheus: http://localhost:9090
   - **Grafana**: [http://localhost:3001](http://localhost:3001)  
      Login padrão: `admin` / `admin`
   - **Kafka UI**: [http://localhost:8080](http://localhost:8080)
   - **MongoDB Express**:[http://localhost:8081](http://localhost:8081)

## 📘 Documentação da Solução

### 📐 Arquitetura

A arquitetura segue os princípios de Clean Architecture + DDD (Domain-Driven Design) com separação clara entre domínio, aplicação e infraestrutura.

```bash
    src/
    ├── core/           # Tipos e utilitários comuns
    ├── domain/
    │     ├── application/  # Casos de uso e contratos/portas (interfaces)
    │     └── enterprise/   # Entidades e regras de negócio
    └── infra/
          ├── http/       # Entrada REST (controllers, dtos, presenters)
          ├── messaging/  # Kafka (Publishers e consumers), adaptadores de notificação email e http
          └── metrics/    # Serviço de métricas Prometheus
          └── database/   # Repository e schema para o mongodb.
```

## 📌 Decisões Técnicas

1. **Arquitetura desacoplada baseada em Ports & Adapters**

- Todo o fluxo de negócios (como retentativas, atualizações de status, etc.) foi implementado dentro do domínio, desacoplado da infraestrutura. Isso permite a substituição fácil de mecanismos externos (como o broker Kafka ou até o banco de dados) sem impacto nas regras de negócio.

2. **Lógica de retry automático e manual encapsulada no domínio**

- As regras de retentativa (com limite e backoff) e reprocessamento manual foram centralizadas no domínio e expostas por meio de casos de uso. A lógica é orquestrada por use cases, respeitando o ciclo de vida da entidade `Message`.

3. **Uso de MongoDB para suportar payloads flexíveis e dinâmicos**

- Como o conteúdo da mensagem (payload) pode variar amplamente por tipo (webhook, email, etc.), optei por MongoDB como solução flexível e não relacional para armazenar esse campo sem a rigidez de esquemas fixos.

4. **Implementação de Factory para envio de mensagens**

- Ao enviar notificações, foi aplicada uma `NotifierFactory` que resolve dinamicamente o tipo de envio (http, email, etc.). Isso facilita a extensão futura para outros canais (SMS, push, etc.) com mínimo impacto.

5. **Aplicação do padrão Either para domínio e tratamento de erros esperados**

- O pattern Either foi adotado em pontos-chave da aplicação para lidar com erros conhecidos de forma elegante e explícita, melhorando a clareza e a testabilidade de casos de uso e serviços internos.

6. **Adaptação dos princípios de Ports & Adapters de forma pragmática**

- O projeto reflete os princípios hexagonais, com portas (interfaces) declaradas no domínio e adaptadores implementados na infraestrutura, promovendo alta testabilidade e facilidade de evolução.

7. **Uso controlado do decorator @Injectable() no domínio**

- O decorator do NestJS foi utilizado em algumas classes do domínio. Apesar de isso ferir o isolamento ideal do domínio, foi uma escolha consciente e facilmente substituível por um IoC mais agnóstico como TSyringe, InversifyJS ou injeção manual.

8. **Tratamento de erros com Exception Filters do NestJS**

- A aplicação REST utiliza os filtros globais do NestJS para capturar e formatar exceções. No entanto, o design também permite facilmente a substituição por um handler global manual, se desejado.

## 🧪 Como Testar

### 🧪 Teste manual via Swagger, Postman ou Insomnia

Para testar a API manualmente:

1. Acesse a interface Swagger em:  
   [http://localhost:3000/api](http://localhost:3000/api)

2. Faça uma requisição `POST` para o endpoint `/messages`.

3. Use o seguinte payload de exemplo:

```json
{
  "type": "http",
  "destination": "https://webhook.site/<sua-url-unica>",
  "payload": {
    "event": "order.created",
    "data": {
      "qualquer": "coisa"
    }
  }
}
```

> 🔗 Você pode gerar uma URL temporária para teste acessando:  
> https://webhook.site

---

### ✅ Simular cenários de sucesso e falha

A API possui um endpoint interno para simular falhas em chamadas HTTP, ideal para testar o sistema de retentativas:

- Para **simular sucesso**:

```json
"destination": "http://localhost:3000/test/webhook?failureRate=0"
```

- Para **simular falha**:

```json
"destination": "http://localhost:3000/test/webhook?failureRate=100"
```

---

### 🔁 Script interativo (modo automático)

Use o script `test-requests.sh` para testar diferentes funcionalidades da API:

```bash
chmod +x test-requests.sh
./test-requests.sh
```

#### 🔍 Modos disponíveis

```bash
./test-requests.sh health     # Teste de saúde da API
./test-requests.sh webhook    # Disparo de mensagem HTTP
./test-requests.sh messages   # Criação e processamento
./test-requests.sh bulk       # Teste em massa
./test-requests.sh errors     # Teste de cenários de falha
./test-requests.sh metrics    # Verificar métricas Prometheus
./test-requests.sh all        # Executar todos os testes
```

---

### 🔎 Consulta de mensagens

Após criar uma mensagem, você pode consultar seu status usando o `id` retornado:

```
GET /messages/:id
```

---

### 🔁 Retry manual

A API permite forçar uma nova tentativa de envio para mensagens com status `failed`. Para isso, utilize o seguinte endpoint:

```

POST /messages/:id/retry

```

Substitua `:id` pelo identificador da mensagem que falhou.

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3000/messages/662fa1f92d9e19a8f315ce42/retry
```

Ao chamar esse endpoint, o sistema irá reenfileirar a mensagem para reprocessamento imediato, respeitando as regras de tipo e destino originais. (3 novas tentativas)

## ✅ Status Atual

- [x] API REST com validação e Swagger
- [x] Persistência MongoDB
- [x] Processamento assíncrono com Kafka
- [x] Retentativas com backoff exponencial
- [x] Exposição de métricas Prometheus
- [x] Integração com Grafana
- [x] Testes manuais via script

## 📈 Possíveis Melhorias

- **Dead Letter Queue (DLQ):** mensagens que falharem várias vezes vão para uma fila separada, para que possamos analisar depois o que deu errado.

- **Circuit Breaker:** ao enviar requisições HTTP externas, interrompe tentativas se o destino estiver instável, evitando sobrecarregar e permitir recuperação mais rápida.```

## 💡 Nota Final

Embora fosse possível resolver o desafio com uma solução mais simples, optei por aplicar uma arquitetura mais robusta de forma intencional, justamente por se tratar de um teste técnico explorando ao máximo as possibilidades. (**Overengineer proposital**)

## 👨‍💻 Autor

[Wendryo Sales](https://github.com/wendryosales) • Desenvolvedor Back-end

> Este projeto foi desenvolvido como parte de um desafio técnico com foco em arquitetura limpa, mensageria, resiliência e observabilidade.
