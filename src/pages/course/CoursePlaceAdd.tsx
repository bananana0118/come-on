import React from "react"
import { useParams } from "react-router-dom"
import { PlaceType } from "types/API/course-service"
import SearchPlace from "pages/course/SearchPlace"

const CoursePlaceAdd = (): JSX.Element => {
  return <SearchPlace mode={PlaceType.c} editMode={false} id={undefined} />
}

export const CoursePlaceEditModeAdd = (): JSX.Element => {
  const { id } = useParams()

  return <SearchPlace mode={PlaceType.c} editMode id={Number(id)} />
}

export default CoursePlaceAdd
