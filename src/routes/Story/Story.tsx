// Story.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";

const Story = () => {
  const location = useLocation();
  const isRootPath = location.pathname === "/create-story";
  const isEditorRoute = location.pathname.match(/^\/create\/[^/]+$/);

  // When editor is active, render without any extra containers
  if (isEditorRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col bg-neutral-50 dark:bg-black min-h-screen transition-colors duration-200">
      <nav className="pt-20">
        <ul className="flex space-x-4">
          {["Editor", "Plot", "Characters", "Places", "Dashboard"].map(
            (tab) => (
              <li key={tab}>
                <NavLink
                  to={tab.toLowerCase() === "editor" ? "" : tab.toLowerCase()}
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive || (isRootPath && tab === "Editor")
                        ? "bg-dark-green dark:bg-light-green text-white hover:bg-light-green dark:hover:bg-dark-green"
                        : "text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-neutral-50/10"
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

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Story;
