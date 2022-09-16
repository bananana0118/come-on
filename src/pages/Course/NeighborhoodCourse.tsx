import React from "react"
import { Grid } from "@mui/material"

import Header from "components/user/course/ourNeighborhood/Header"
import SpeedDial from "components/user/course/ourNeighborhood/SpeedDial"
import CourseList from "components/user/course/ourNeighborhood/NeighborhoodCourseList"

import img from "assets/course/course2.jpg"

const testPorsp = {
  img: {
    src: img,
    alt: "Breakfast2",
  },
  isLike: false,
  texts: {
    title: "사진찍기 좋은 부산 여행 코스2",
    userName: "여행마스터",
    time: "2022.08.03",
  },
}

const NeighborhoodCourse = (): JSX.Element => {
  return (
    // 콘텐츠 영역 #1
    <Grid container component="main" direction="column" minHeight={1}>
      <Header />
      <CourseList info={testPorsp} />
      <SpeedDial />
    </Grid>
  )
}

export default NeighborhoodCourse
