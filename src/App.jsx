import "./App.css";
import Chart from "./components/Chart";
import { metric } from "./constants/data";

function App() {
  return (
    <section className="min-h-screen bg-[#f3f5f8] px-6 py-8">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6">
        <h1 className="m-0 text-2xl font-bold text-[#1a1f2b]">
          Build Custom Charts using Recharts
        </h1>
        <Chart metric={metric} />
      </div>
    </section>
  );
}

export default App;
