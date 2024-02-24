import {Plus, Search, FileDown, MoreHorizontal, Filter, Loader2} from "lucide-react"
import {Header} from "./components/header.tsx";
import {Tabs} from "./components/tabs.tsx";
import {Button} from "./components/ui/button.tsx";
import {Control, Input} from "./components/ui/input.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./components/ui/table.tsx";
import {Pagination} from "./components/pagination.tsx";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {useSearchParams} from "react-router-dom";
import {FormEvent, useState} from "react";
import * as Dialog from '@radix-ui/react-dialog';
import {CreateTagForm} from './components/create-tag-form.tsx';

export interface TagResponse {
    first: number
    prev: number | null
    next: number
    last: number
    pages: number
    items: number
    data: Tag[]
}

export interface Tag {
    title: string
    slug: string
    amountOfVideos: number
    id: string
}

export function App() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlFilter = searchParams.get('filter') ?? ''

    const [filter, setFilter] = useState(urlFilter);
    const per_page = searchParams.get("per_page") ? Number(searchParams.get("per_page")) : 10;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    const {data: tagsResponse, isLoading, isFetching} = useQuery<TagResponse>({
        queryKey: ['get-tags', urlFilter, page, per_page],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3333/tags?_page=${page}&_per_page=${per_page}&title=${urlFilter}`)
            const data = await response.json()
            return data
        },
        placeholderData: keepPreviousData
    });

    function handleFilter(event: FormEvent) {
        event.preventDefault()

        setSearchParams(params => {
            params.set('page', '1')
            params.set('filter', filter)

            return params
        })
    }

    if (isLoading) {
        return null;
    }

    return (
        <div className="py-10 space-y-8">
            <div>
                <Header/>
                <Tabs/>
            </div>
            <main className="max-w-6xl mx-auto space-y-5">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">Tags</h1>


                    <Dialog.Root>
                        <Dialog.Trigger asChild>
                            <Button variant='primary'>
                                <Plus className="size-3"/>
                                Create new
                            </Button>
                        </Dialog.Trigger>

                        <Dialog.Portal>
                            <Dialog.Overlay className="fixed inset-0 bg-black/70"/>
                            <Dialog.Content
                                className="fixed space-y-10 p-10 right-0 top-0 bottom-0 h-screen min-w-[320px] z-10 bg-zinc-950 border-l border-zinc-900">
                                <div className="space-y-3">
                                    <Dialog.Title className="text-xl font-bold">
                                        Create tag
                                    </Dialog.Title>
                                    <Dialog.Description className="text-sm text-zinc-500">
                                        Tags can be used to group videos about similar concepts.
                                    </Dialog.Description>
                                </div>

                                <CreateTagForm/>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>

                    {isFetching && <Loader2 className="size-4 animate-spin text-zinc-500"/>}
                </div>
                <div className="flex items-center justify-between">
                    <form onSubmit={handleFilter} className="flex items-center gap-2">
                        <div className="flex items-center">
                            <Input variant="filter">
                                <Search className="size-3"/>
                                <Control placeholder="Search tags..." onChange={e => {
                                    setFilter(e.target.value)
                                }} value={filter}/>
                            </Input>
                            <Button type="submit">
                                <Filter className="size-3"/>
                                Apply filters
                            </Button>
                        </div>
                    </form>
                    <Button>
                        <FileDown className="size-3"/>
                        Export
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Amount of videos</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tagsResponse?.data.map((tag) => {
                            return (
                                <TableRow key={tag.id}>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-medium">{tag.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-500">
                                        {tag.slug}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                        {tag.amountOfVideos} video(s)
                                    </TableCell>
                                    <TableCell>
                                        <Button size="icon">
                                            <MoreHorizontal className="size-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                        }
                    </TableBody>
                </Table>

                {tagsResponse && <Pagination pages={tagsResponse.pages} items={tagsResponse.items} page={page} itemsPerPage={per_page}/>}
            </main>
        </div>
    )
}
