import "./App.css";
import SimpleBarChart from "./components/SimpleBarChart";

function App() {
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 p-4">
        <div>
          <h1 className="font-bold text-2xl">
            Build Custom Charts using Recharts
          </h1>
        </div>
        <SimpleBarChart />
      </section>
    </>
  );
}

export default App;
