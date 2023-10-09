import { useEffect, useRef } from 'react'
import { Image, Transformer } from 'react-konva'
import useImage from 'use-image'

export default function CustomImage({ image, shapeProps, isSelected, onSelect, onChange }) {
    const [img] = useImage(image.src)

    const shapeRef = useRef()
    const trRef = useRef()

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current])
            trRef.current.getLayer().batchDraw()

            // Move to top on select
            shapeRef.current.moveToTop()
            trRef.current.moveToTop()
        }
    }, [isSelected])

    return (
        <>
            <Image
                image={img}
                x={image.x}
                y={image.y}
                draggable
                alt="Image dragged"
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    })
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current
                    const scaleX = node.scaleX()
                    const scaleY = node.scaleY()

                    // we will reset it back
                    node.scaleX(1)
                    node.scaleY(1)
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    })
                }}
            />

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox
                        }
                        return newBox
                    }}
                />
            )}
        </>
    )
}
