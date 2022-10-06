import React, { useEffect, useState, useRef, ReactElement } from "react"

import ReactDOMServer from "react-dom/server"
import { InputAdornment, TextField, Box, Pagination } from "@mui/material"
import { Search } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { generateComponent } from "utils"
import SearchCard from "components/common/card/SearchCard"
import { SearchCardProp } from "types/API/course-service"

const { kakao } = window

const SearchBar = styled(TextField)(() => ({
  padding: "10px",
  margin: "10px 0",
}))

const ListContainer = styled(Box)(() => ({
  padding: "10px",
}))

const PaginationStyle = {
  margin: "0, auto",
  display: "flex",
  justifyContent: "center",
}

interface ListDetailCardProp {
  index: number // 카드의 인덱스 넘버 - order
  address_name: string // 주소
  category_name: string // 플레이스 카테고리 -placeCategory
  place_name: string // 장소 이름           -name
  place_url: string // 플레이스 주소        -
  x: number // 경도 longitude              -lon
  y: number // 위도 latitude               -lat
  description: string // 설명              -description
  id: number // 카카오 id                  -kakaoPlaceId
}

export interface MapProps {
  title: string
  position: any
  content: string
}

enum PlaceType {
  m = "meeting",
  c = "course",
}
interface SearchPlaceProps {
  mode: PlaceType
}

const MyMarker = ({
  place_name: placeName,
  place_url: placeUrl,
}: SearchCardProp): JSX.Element => {
  return (
    <div style={{ padding: "5px", fontSize: "12px" }}>
      <a
        href={placeUrl}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: "none" }}
      >
        {placeName}
      </a>
    </div>
  )
}

const SearchPlace = ({ mode }: SearchPlaceProps): JSX.Element => {
  const [selectedNumber, setselectedNumber] = useState("")
  const [inputedKeyword, setInputedKeyword] = useState<string>("")
  const [searchKeyword, setSearchKeyword] = useState<string>("")
  const [searchedData, setSearchedData] = useState<ListDetailCardProp[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const refPagenation = useRef<any>()

  const mapContainer = useRef<HTMLDivElement>(null) // 지도를 표시할 div

  // 검색창을 이용해 키워드를 검색
  const handleSearchBar = (): void => {
    setSearchKeyword(inputedKeyword)
  }

  // 선택한 페이지의 정보 출력
  const handlePagenation = (page: number): void => {
    setSelectedPage(page)
  }

  // 검색창에서 엔터키를 칠때만 검색되도록 설정 - 모바일에서 문제 생기는지 확인
  const onKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSearchBar()
      setSelectedPage(1)
    }
  }

  // 검색한 키워드의 페이지 네이션 개수 설정
  const setPageCount = (page: number): void => {
    setLastPage(page)
  }

  // 리스트 클릭했을 시 색 바뀌는 함수 + 목록에 추가되도록
  const onClickFocus = (event: React.MouseEvent<HTMLDivElement>): void => {
    const e = event?.currentTarget
    if (e) {
      setselectedNumber(e.id)
    } else setselectedNumber("")
  }

  // 마커를 맵에 표시
  const displayMarker = (map: any, infowindow: any, place: any): void => {
    const marker = new kakao.maps.Marker({
      map,
      position: new kakao.maps.LatLng(place.y, place.x),
    })

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, "click", function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      const myMarker = MyMarker(place)
      const renderedMarger = ReactDOMServer.renderToString(myMarker)

      infowindow.setContent(renderedMarger)
      infowindow.open(map, marker)
    })
  }

  useEffect(() => {
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1, width: "100px" })
    const container = mapContainer.current

    const options = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    }

    const map = new kakao.maps.Map(container, options)
    const imageSrc =
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"
    const imageSize = new kakao.maps.Size(64, 69)
    const imageOption = { offset: new kakao.maps.Point(27, 69) }

    const ps = new kakao.maps.services.Places()
    const pageOptions = {
      size: 5, // 나중에 설정한 위치 기준으로 할 것
      location: new kakao.maps.LatLng(37.566826, 126.9786567),
      radius: 500, // 500미터 내외로 검색
      SORT_BY: "DISTANCE",
    }

    const placesSearchCB = (data: any, status: any, pagination: any): any => {
      pagination.gotoPage(selectedPage)

      if (data !== "ERROR" && pagination.current === selectedPage) {
        setSearchedData(data)
      }
      setPageCount(pagination.last)

      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds()
        for (let i = 0; i < data.length; i += 1) {
          displayMarker(map, infowindow, data[i])
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x))
        }
        map.setBounds(bounds)
      }
    }

    if (searchKeyword !== "") {
      ps.keywordSearch(searchKeyword, placesSearchCB, pageOptions)
    }
  }, [selectedPage, searchKeyword])

  return (
    <>
      <header>{/* 검색창 만들기 */}</header>
      <SearchBar
        sx={{ width: "100%" }}
        id="tfSearch"
        value={inputedKeyword}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        onChange={(e) => {
          setInputedKeyword(e.target.value)
        }}
        onKeyDown={onKeyPress}
      />
      <div
        id="map"
        ref={mapContainer}
        style={{ width: "100%", height: "20rem" }}
      />

      <ListContainer>
        {searchedData?.length !== 0 &&
          generateComponent(searchedData, (item, key) => (
            <SearchCard
              item={item}
              onClickFocus={onClickFocus}
              selectedNumber={selectedNumber}
              mode={mode}
            />
          ))}
      </ListContainer>
      <Pagination
        count={lastPage}
        sx={PaginationStyle}
        onChange={(e, v) => {
          handlePagenation(v)
        }}
        ref={refPagenation}
      />
    </>
  )
}

export default SearchPlace
