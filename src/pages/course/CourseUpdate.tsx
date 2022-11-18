import React from "react"
import { Route, Routes } from "react-router-dom"

import { CoursePlaceEditModeAdd } from "pages/course/CoursePlaceAdd"

import RequireAuth from "components/auth/RequireAuth"

import CourseEditLayout from "./CourseEditLayout"

const AuthEditCourse = (): JSX.Element => (
  <RequireAuth>
    <CourseEditLayout />
  </RequireAuth>
)
const CourseUpdate = (): JSX.Element => {
  return (
    <Routes>
      <Route index element={<AuthEditCourse />} />
      <Route path="/register" element={<CoursePlaceEditModeAdd />} />
    </Routes>
  )
}

export default CourseUpdate
