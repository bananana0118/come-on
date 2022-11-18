/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import {
  fetchByIdCourseDetail,
  updateCoursePlace,
  useDeleteCoursePlaceMutation,
  useModifyCoursePlaceMutation,
} from "features/course/courseSlice"

import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { AppDispatch, RootState } from "store"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { generateComponent, getReorderedPlaces } from "utils"
import AddCourseBox from "components/common/course/AddCourseBox"
import MapContainer from "components/common/course/MapContainer"
import {
  CoursePlace,
  CoursePlaceProps,
  PlaceType,
} from "types/API/course-service"
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"
import PlaceDetailDraggableCard from "components/common/card/PlaceDetailDraggableCard "

const IconContainer = styled(Box)(() => ({
  display: "flex",
  justifyContent: "right",
}))

const MainContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}))

const MAIN_CONTAINER = {
  padding: "20px",
}

interface pageProps {
  page: number
  setPage: Dispatch<SetStateAction<number>>
  id: number
}

const CourseEditDetail2 = ({ id, setPage }: pageProps): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>()
  const [isValid, setIsValid] = useState(false)
  const [deleteCoursePlace] = useDeleteCoursePlaceMutation()
  const [modifyCoursePlace] = useModifyCoursePlaceMutation()
  const [placeData, setPlaceData] = useState<CoursePlace[]>([])
  const [selectedNumber, setselectedNumber] = useState<string>("")
  const placeList: CoursePlaceProps[] = useSelector((state: RootState) => {
    return state.course.coursePlaces
  })

  const navigate = useNavigate()

  const dis = useCallback(async () => {
    const myCourseData = await dispatch(fetchByIdCourseDetail(id))
    const myData: any = myCourseData
    dispatch(updateCoursePlace(myData.payload.coursePlaces))
    setPlaceData(myData.payload.coursePlaces)
  }, [dispatch, id])

  useEffect(() => {
    dis()
  }, [dis])

  const onValid = useCallback((): void => {
    if (placeData === undefined || placeData.length !== 0) setIsValid(true)
    else {
      setIsValid(false)
    }
  }, [placeData])

  useEffect(() => {
    onValid()
  }, [isValid, onValid])

  const onClickFocus = (event: React.MouseEvent<HTMLDivElement>): any => {
    const e = event?.currentTarget
    if (e) {
      setselectedNumber(e.id)
    } else {
      setselectedNumber("")
    }
  }

  // 장소 수정
  const onDragEnd = async (result: DropResult): Promise<void> => {
    const reorderedPlaces = getReorderedPlaces(
      result,
      placeData,
      PlaceType.c
    ) as CoursePlace[]

    const sourcePlace = reorderedPlaces[result.source.index]

    const queryData = {
      courseId: id,
      placeId: sourcePlace.id,
      data: {
        description: sourcePlace.description,
        order: sourcePlace.order,
        category: sourcePlace.category,
      },
    }

    dispatch(updateCoursePlace(reorderedPlaces))
    setPlaceData(reorderedPlaces)
    await modifyCoursePlace(queryData)
  }

  // 장소 삭제
  const onRemove = async (placeId: number): Promise<void> => {
    const res = await deleteCoursePlace({
      courseId: String(id),
      coursePlaceId: String(placeId),
    })

    const resData = res as any
    const newData = resData.data.data.coursePlaces
    setPlaceData(newData)
    dispatch(updateCoursePlace(newData))
  }

  const onClicKNextPage = async (): Promise<void> => {
    dispatch(updateCoursePlace(placeData))
    setPage(4)
    navigate(`/course/${id}/update`, { state: 3 })
  }

  const handleAddClick = (): void => {
    setPage(2)
  }
  return (
    placeList && (
      <MainContainer sx={MAIN_CONTAINER}>
        {placeList.length !== 0 && (
          <MapContainer
            selectedNumber={selectedNumber}
            placeLists={placeList}
            isSuccess={placeList !== undefined}
          />
        )}
        <IconContainer />
        {placeList && placeList[0] !== undefined && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="placeData">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {generateComponent(placeList, (item, key) => (
                    <PlaceDetailDraggableCard
                      item={{ ...item, id: item.id }}
                      key={key}
                      onClick={onClickFocus}
                      isSelected={
                        item.order ===
                        (selectedNumber === "" ? -10 : Number(selectedNumber))
                      }
                      editing
                      onRemove={onRemove}
                      maxLen={placeList.length}
                      mode={PlaceType.c}
                    />
                  ))}

                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <AddCourseBox onClick={handleAddClick} />
        <CourseNextStepButton
          content="다음단계"
          isValid={isValid}
          onClick={onClicKNextPage}
        />
      </MainContainer>
    )
  )
}

export default CourseEditDetail2
