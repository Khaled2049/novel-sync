import { Outlet, NavLink, useLocation } from "react-router-dom";

const Story = () => {
  const location = useLocation();
  const isRootPath = location.pathname === "/create-story";

  return (
    <div className="flex flex-col ">
      <nav className=" pt-20">
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
                        ? " text-white"
                        : " "
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

      <main className="flex-grow overflow-auto ">
        <Outlet />
      </main>
    </div>
  );
};

export default Story;
