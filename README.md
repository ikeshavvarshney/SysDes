# SystemSketch

SystemSketch is a **modular system design, simulation, and analysis platform** that helps developers model, stress-test, and reason about complex systems before they fail in the real world.

This project focuses on **clarity over hype** and **logic over assumptions**. Instead of static diagrams and vague discussions, SystemSketch turns system design into something executable and observable.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Simulation Flow](#simulation-flow)
- [Auto-Scaling Logic](#auto-scaling-logic)
- [Suggestions Engine](#suggestions-engine)
- [Configuration](#configuration)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [License](#license)

---

## 🧩 Overview

SystemSketch allows developers to simulate system behavior under varying load, traffic, and failure conditions.  
It provides insights into **bottlenecks, breaking points, and scaling behavior** without touching production infrastructure.

This is not a diagramming tool.  
This is **system thinking backed by execution**.

---

## ✨ Key Features

- Modular and extensible architecture
- Load and traffic simulation
- System collapse and recovery modeling
- Auto-scaling decision logic
- Centralized state management
- Rule-based suggestion engine
- Hackathon-ready with real-world potential

---

## 🏛️ Architecture

SystemSketch follows a **logic-first modular architecture**:

- **Simulation Layer** – Models system behavior under stress
- **Scaling Layer** – Reacts to metrics and adjusts capacity
- **Analysis Layer** – Evaluates outcomes and bottlenecks
- **Suggestion Layer** – Recommends improvements
- **State Layer** – Maintains global system state

Each layer is independent but interoperable.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React
- **State Management:** Zustand
- **Styling:** Tailwind CSS 
- **Simulation Logic:** Custom JavaScript modules
- **Auth:** Mock / fake authentication
- **Deployment:** Vercel 

No unnecessary libraries. Every dependency has a purpose.

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/systemsketch.git
cd systemsketch
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## ▶️ Usage

SystemSketch is designed to be used iteratively. You define constraints, run simulations, observe behavior, and refine the system based on evidence — not assumptions.

### Basic Workflow

1. Configure initial system parameters such as load, traffic rate, and capacity limits.
2. Start the simulation to inject traffic into the system.
3. Monitor how the system responds under increasing or fluctuating load.
4. Observe scaling actions and failure points in real time.
5. Review generated insights and recommendations.
6. Adjust parameters and rerun simulations as needed.

This loop is intentional. System design is never one-and-done.

---

## 🔄 Simulation Flow

The simulation follows a deterministic and transparent execution flow:

1. System constraints are initialized.
2. Traffic and load patterns are applied.
3. Resource utilization metrics are continuously evaluated.
4. Auto-scaling rules are triggered when thresholds are crossed.
5. The system either stabilizes or degrades based on configuration.
6. Final state data is passed to the analysis layer.

Every state transition is explicit and traceable.

---

## 📈 Auto-Scaling Logic

Auto-scaling in SystemSketch is rule-driven, not probabilistic.

Scaling decisions are based on:
- Load thresholds
- Resource utilization levels
- Response time limits
- Cool-down intervals

Scaling actions include:
- Horizontal scale-up
- Scale-down to reduce over-provisioning
- Failure signaling when limits are exceeded

All rules are configurable and intentionally simple to avoid opaque behavior.

---

## 💡 Suggestions Engine

The suggestions engine evaluates simulation outcomes and identifies inefficiencies.

It analyzes:
- Repeated failure patterns
- Delayed scaling responses
- Resource underutilization
- Bottleneck persistence

Based on this analysis, it generates concrete system-level recommendations such as:
- Adjusting scaling thresholds
- Increasing baseline capacity
- Modifying traffic handling strategies

No generic advice. Only data-backed suggestions.

---

## ⚙️ Configuration

System behavior can be customized through configuration parameters, including:
- Maximum and minimum capacity limits
- Load and traffic intensity
- Scaling thresholds
- Simulation duration and step size

These parameters allow SystemSketch to adapt to different system models without code changes.

---

## ⚠️ Limitations

SystemSketch is a simulation and analysis tool, not a production monitoring system.

Current limitations include:
- No live cloud or infrastructure integration
- Simplified failure modeling
- Approximate performance metrics

Use it to reason about systems, not to replace real-world observability tools.

---

## 🚧 Future Improvements

Planned and potential enhancements include:
- Visual system graph editor
- Real-time performance dashboards
- Support for multiple scaling strategies
- Plugin-based simulation modules
- CI/CD pipeline stress testing

The architecture is built to support growth without rewrites.

---

## 🤝 Contributing

Contributions are expected to prioritize:
- Code clarity
- Logical consistency
- Minimal complexity

Before submitting a pull request:
1. Open an issue describing the change.
2. Ensure new logic is well-documented.
3. Avoid introducing unnecessary dependencies.

Quality > Quantity.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributors

- [Yash Vardhan Shukla](https://github.com/Yash-vs9)
- [Keshav Varshney](https://github.com/ikeshavvarshney)
- [Anmol Maheshwari](https://github.com/codewisp-ai)