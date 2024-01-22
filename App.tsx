import "react-native-gesture-handler"

import { useCallback, useRef, useState } from "react"
import {
  Alert,
  FlatList,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler"

export default function App() {
  const [startIndex, setStartIndex] = useState<number>()
  const [endIndex, setEndIndex] = useState<number>()
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]

  const resetState = () => {
    setStartIndex(undefined)
    setEndIndex(undefined)
  }

  const isWithinRange = (index: number) => {
    if (!startIndex || !endIndex) {
      return false
    }

    return (
      (index >= startIndex && index <= endIndex) ||
      (index >= endIndex && index <= startIndex)
    )
  }

  const cellSize = useRef<{ width: number; height: number }>()
  const CELL_MARGIN = 5
  const TABLE_ROWS = 4

  const handleDragSelection = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (!cellSize.current) {
        return
      }

      const cellWidth = cellSize.current.width + CELL_MARGIN * 2
      const cellHeight = cellSize.current.height + CELL_MARGIN * 2

      const targetColumn = Math.floor((x - CELL_MARGIN) / cellWidth)
      const targetRow = Math.floor((y - CELL_MARGIN) / cellHeight)

      return targetRow * TABLE_ROWS + targetColumn
    },
    []
  )

  const gesture = Gesture.Pan()
    .onBegin(({ x, y }) => {
      const index = handleDragSelection({ x, y })

      setStartIndex(index)
      setEndIndex(index)
    })
    .onChange(({ x, y }) => setEndIndex(handleDragSelection({ x, y })))
    .onFinalize(() => {
      if (!startIndex || !endIndex) {
        return false
      }

      //resetState()
    })
    .shouldCancelWhenOutside(true)
    .onTouchesCancelled(() => resetState())

  const onLayout = useCallback(
    (event: LayoutChangeEvent) =>
      event.target.measure(
        (_, __, width: number, height: number) =>
          (cellSize.current = { width, height })
      ),
    []
  )

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <FlatList
          data={letters}
          keyExtractor={(letters) => letters}
          numColumns={4}
          renderItem={({ item, index }) => {
            const isSelected = isWithinRange(index)

            return (
              <View
                key={item}
                style={[
                  styles.letterButton,
                  isSelected && styles.selectedLetter,
                ]}
                onLayout={index === 1 ? onLayout : undefined}
              >
                <Text>{item}</Text>
              </View>
            )
          }}
        />
      </GestureDetector>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    padding: 32,
  },
  letterButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    width: 40,
    height: 40,
    margin: 5,
  },
  selectedLetter: {
    backgroundColor: "yellow",
  },
})
