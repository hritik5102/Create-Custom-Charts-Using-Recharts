import "./App.css";
import Chart from "./components/Chart";
import { metric } from "./constants/data";

function App() {
  return (
    <section className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="mx-auto flex w-full max-w-270 flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Build Custom Charts using Recharts
        </h1>
        <Chart metric={metric} />
      </div>
    </section>
  );
}

export default App;
