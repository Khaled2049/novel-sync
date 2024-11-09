import PlotTimeline from "../../components/plot/PlotTimeline";

const Plot: React.FC = () => {
  return (
    <div className="p-6 bg-amber-50 min-h-screen">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Plot Timeline</h1>
      <PlotTimeline />
    </div>
  );
};

export default Plot;
