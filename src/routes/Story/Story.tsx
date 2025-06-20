import { Outlet, NavLink, useLocation } from "react-router-dom";

const Story = () => {
  const location = useLocation();
  const isRootPath = location.pathname === "/create-story";

  return (
    <div className="flex flex-col ">
      <nav className="bg-amber-100 pt-20">
        <ul className="flex space-x-4">
          {["Editor", "Plot", "Characters", "Places", "Dashboard"].map(
            (tab) => (
              <li key={tab}>
                <NavLink
                  to={tab.toLowerCase() === "editor" ? "" : tab.toLowerCase()}
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md ${
                      isActive || (isRootPath && tab === "Editor")
                        ? "bg-amber-800 text-white"
                        : "text-amber-800 hover:bg-amber-200"
                    }`
                  }
                >
                  {tab}
                </NavLink>
              </li>
            )
          )}
        </ul>
      </nav>

      <main className="flex-grow overflow-auto bg-amber-50">
        <Outlet />
      </main>
    </div>
  );
};

export default Story;
