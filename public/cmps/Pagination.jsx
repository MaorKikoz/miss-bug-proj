const { useState } = React
const PAGE_SIZE = 3

export function Pagination({ pageCount, filterBy, onSetFilterBy }) {
    const [ paginationOn, setPaginationOn ] = useState(false)

    function onTogglePagination(ev) {
        if (paginationOn) {
            setPaginationOn(false)
            onSetFilterBy({ pageIdx: undefined })
        } else {
            setPaginationOn(true)
            onSetFilterBy({ pageIdx: 0, pageSize: PAGE_SIZE })
        }
    }
    
    function onPage(diff) {
        const pageIdx = filterBy.pageIdx + diff
        onSetFilterBy({ pageIdx })
    }

    return <div className="pagination">
        <label className="tag">Pagination
            <input 
                onChange={onTogglePagination} 
                type="checkbox" 
                checked={paginationOn} />
        </label>
        
        {paginationOn && <button 
            disabled={filterBy.pageIdx === 0} 
            onClick={() => onPage(-1)}>Prev</button>}

        {paginationOn && <button 
            disabled={filterBy.pageIdx === pageCount - 1} 
            onClick={() => onPage(1)}>Next</button>}
    </div>
}