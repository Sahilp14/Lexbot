import Sidebar from "../component/Sidebar/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Sidebar />

      <div
        style={{
          marginLeft: "300px", // SAME as sidebar width
          height: "100vh",
          overflowY: "auto",
          padding: "30px",
          background: "#f8fafc",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default DashboardLayout;