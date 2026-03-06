import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "./components/layout/main-layout"
import { HomePage } from "./pages/home-page"
import { ProjectPage } from "./pages/project-page"
import courseData from "./data/course-data.json"
import type { CourseData } from "./types"
import { registerUnits } from "./lib/unit-colors"

const data = courseData as CourseData

// Register unit names so colors are assigned dynamically
registerUnits(data.courseStructure.units.map((u) => u.unitName))



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout data={data} />}>
          <Route path="/" element={<HomePage data={data} />} />
          <Route path="/projects/:projectId" element={<ProjectPage data={data} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
