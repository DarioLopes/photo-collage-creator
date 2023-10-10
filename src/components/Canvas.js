import useWindowSize from '@/utils/hooks'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'
import CustomImage from './CustomImage'

function downloadURI(uri, name) {
    let link = document.createElement('a')
    link.download = name
    link.href = uri
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export default function Canvas() {
    const size = useWindowSize() // Custom hook to get window size
    const [search, setSearch] = useState('')
    const [images, setImages] = useState([])
    const [page, setPage] = useState(1)
    const perPage = 12

    const dragUrl = useRef()
    const stageRef = useRef()

    // Handle export
    const [isExporting, setIsExporting] = useState(false)
    const handleExport = () => {
        setIsExporting(true)
        const uri = stageRef.current.toDataURL()
        const date = new Date()

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const hour = date.getHours()
        const min = date.getMinutes()
        const sec = date.getSeconds()

        // This arrangement can be altered based on how we want the date's format to appear.
        const currentDate = `${day}-${month}-${year}-${hour}-${min}-${sec}`

        downloadURI(uri, `export-photocollage-${currentDate}.png`)

        setIsExporting(false)
    }

    // Handle drag and drop to canvas
    const [imagesDragged, setImagesDragged] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty) setSelectedId(null)
    }

    // Next / Prev pagination on search results
    const handlePaging = (value) => {
        if (value === -1) {
            if (page > 1) setPage(page - 1)
        } else {
            setPage(page + 1)
        }

        if (search) getImages(search)
    }

    // Get images from Unsplash API
    const getImages = async (searchQuery) => {
        try {
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=${perPage}&page=${page}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`)
            if (!response.ok) throw new Error('Network response was not ok')

            const responseData = await response.json()
            const responseImages = responseData?.results?.map((image) => image.urls.small) || []

            setImages(responseImages)
        } catch (error) {
            console.error('Error fetching data:', error)
            return []
        }
    }

    // Handle search form
    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = e.target[0].form
        const searchQuery = data.search.value

        setSearch(searchQuery)

        // Wait for response
        await getImages(searchQuery)
    }

    // Handle uploaded images
    const inputRef = useRef(null)
    const [files, setFiles] = useState([])
    const [dragActive, setDragActive] = useState(false) // Drag and drop active state
    const handleUpload = (e) => {
        const currentFiles = e.target.files || e.dataTransfer.files // target => from input click | dataTransfer => from drag and drop
        const uploaded = Array.from(currentFiles) // convert fileList to array

        uploaded.map((file) => {
            // create blob url for each file, useful for preview / thumbs
            file.src = URL.createObjectURL(file)
            file.id = URL.createObjectURL(file)

            setFiles((prev) => [...prev, file])
        })
    }

    // Handle drag behavior
    const handleUploadDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    // Handle drop behavior
    const handleUploadDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()

        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleUpload(e)
    }

    return (
        <>
            <aside className="fixed h-[calc(100vh-32px)] overflow-y-scroll w-80 rounded-lg bg-white z-10 top-4 right-4 text-black px-6 pt-6 pb-24 dark:text-white dark:bg-slate-800">
                <form className="w-full relative" onSubmit={(e) => handleSubmit(e)}>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>

                        <input
                            type="search"
                            id="search"
                            class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search images..."
                            required
                        />

                        <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Search
                        </button>
                    </div>

                    {/* Create a small 3 columns grid with tailwin */}
                    {images.length > 0 && search.length > 0 && (
                        <div className="pb-7 pt-5">
                            <div className="text-center pt-4 pb-7">
                                <hr className="border-gray-300 dark:border-gray-600" />
                                <span className="text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-2 -mt-3 block w-fit m-auto">Results for {`"${search}"`}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {images.map((image) => (
                                    <div key={image} className="aspect-square relative rounded-lg overflow-hidden hover:bg-white group">
                                        <Image
                                            src={image}
                                            className="absolute object-cover object-center cursor-grab active:cursor-grabbing group-hover:opacity-80 transition-opacity"
                                            fill
                                            alt="search result"
                                            draggable="true"
                                            onDragStart={(e) => {
                                                dragUrl.current = e.target.src
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Create next/prev navigation with tailwind */}
                            <div className="flex flex-col items-center pt-3">
                                <div className="inline-flex mt-2 xs:mt-0">
                                    <button
                                        onClick={() => handlePaging(-1)}
                                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-slate-800 bg-slate-100 rounded-l hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
                                    >
                                        Prev
                                    </button>

                                    <button
                                        onClick={() => handlePaging(+1)}
                                        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-slate-800 bg-slate-100 border-0 border-l border-white rounded-r hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-600 dark:hover:text-white"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {images.length === 0 && search.length > 0 && (
                        <div className="text-center pt-4 pb-7">
                            <span className="text-gray-500 dark:text-gray-400 dark:bg-slate-800 px-2 block w-fit m-auto">No results for {`"${search}"`}</span>
                        </div>
                    )}

                    <div className="text-center pt-8">
                        <hr className="border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-500 dark:text-gray-400 dark:bg-slate-800 px-2 -mt-3 block bg-white w-fit m-auto">{search ? 'Upload file' : 'Or upload'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6">
                        {files.map((image, i) => (
                            <div key={`${i}-${image}`} className="relative aspect-square rounded-lg overflow-hidden hover:bg-white group w-full">
                                <Image
                                    src={image.src || '#'}
                                    className="absolute object-cover object-center cursor-grab active:cursor-grabbing group-hover:opacity-80 transition-opacity"
                                    fill
                                    alt="search result"
                                    draggable="true"
                                    unoptimized
                                    onDragStart={(e) => {
                                        dragUrl.current = e.target.src
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center w-full relative">
                        <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${
                                dragActive ? 'dark:bg-gray-600 bg-gray-200' : ''
                            } ${files.length > 0 ? 'h-32 mt-5' : 'h-64'}`}
                            onMouseOut={() => setDragActive(false)}
                            onDragEnter={handleUploadDrag}
                            onDragLeave={handleUploadDrag}
                            onDragOver={handleUploadDrag}
                            onDrop={handleUploadDrop}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                </svg>
                                {files.length > 0 ? (
                                    <>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop <span className="font-semibold">more</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>

                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP</p>
                                    </>
                                )}
                            </div>

                            <input id="dropzone-file" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" multiple ref={inputRef} onChange={(e) => handleUpload(e)} />
                        </label>
                    </div>
                </form>

                <div className="bottom-4 right-4 fixed w-80 px-6 pb-4 pt-6 rounded-xl bg-white z-20 text-black dark:text-white dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => handleExport()}
                        className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 w-full focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                    >
                        Export
                    </button>
                </div>
            </aside>

            <div
                onDrop={(e) => {
                    e.preventDefault()
                    // register event position
                    stageRef.current.setPointersPositions(e)
                    // add image
                    setImagesDragged(
                        imagesDragged.concat([
                            {
                                ...stageRef.current.getPointerPosition(),
                                src: dragUrl.current,
                                id: `image-${imagesDragged.length + 1}`,
                            },
                        ])
                    )
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <Stage width={size.width} height={size.height} onMouseDown={checkDeselect} onTouchStart={checkDeselect} ref={stageRef}>
                    <Layer>
                        {imagesDragged.map((image, i) => {
                            return (
                                <CustomImage
                                    key={image.src}
                                    image={image}
                                    shapeProps={image}
                                    isSelected={!isExporting && image.id === selectedId}
                                    onSelect={() => setSelectedId(image.id)}
                                    onChange={(newAttrs) => {
                                        const imagesShape = imagesDragged.slice()
                                        imagesShape[i] = newAttrs
                                        setImagesDragged(imagesShape)
                                    }}
                                />
                            )
                        })}
                    </Layer>
                </Stage>
            </div>
        </>
    )
}
