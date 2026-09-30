import { bugService } from "../services/bug.service.remote.js"
import { LabelChooser } from "./LabelChooser.jsx"

const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {

    const [filterByToEdit, setFilterByToEdit] = useState(filterBy)
    const labels = bugService.getLabels()

    useEffect(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function resetSort() {
        setFilterByToEdit(prev => ({ ...prev, sortField: '', sortDir: 1 }))
    }

    function onResetFilter() {
        setFilterByToEdit(prev => ({ ...prev, txt: '', minSeverity: 0 }))
    }

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value || ''
                break

            case 'radio':
                value = target.value
                break
            case 'checkbox':
                value = target.checked
                break

            default:
                break
        }

        setFilterByToEdit(prevFilter => {
            return ({ ...prevFilter, [field]: value })
        })
    }

    const { txt, minSeverity } = filterByToEdit
    return (
        <section className="bug-filter">
            <h2>Filter</h2>

            <div className="filter-by">
                <label className="tag" htmlFor="txt">Text: </label>
                <input value={txt} onChange={handleChange} type="text" placeholder="By Text" id="txt" name="txt" />

                <label className="tag" htmlFor="minSeverity">Min Severity: </label>
                <input value={minSeverity || ''} onChange={handleChange} type="number" placeholder="By Min Severity" id="minSeverity" name="minSeverity" />

                <button onClick={onResetFilter}>Clear Filter</button>
            </div>
            
            <div className="sort-by">
                <div className="sort-field">
                    <label className="tag" >
                        <span>Title</span>
                        <input
                            type="radio"
                            name="sortField"
                            value="title"
                            checked={filterByToEdit.sortField === 'title'}
                            onChange={handleChange}
                        />
                    </label>
                    <label className="tag" >
                        <span>Severity</span>
                        <input
                            type="radio"
                            name="sortField"
                            value="severity"
                            checked={filterByToEdit.sortField === 'severity'}            
                            onChange={handleChange}
                        />
                    </label>
                    <label className="tag" >
                        <span>Created At</span>
                        <input
                            type="radio"
                            name="sortField"
                            value="createdAt"
                            checked={filterByToEdit.sortField === 'createdAt'}                        
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <div className="sort-dir">
                    <label className="tag" >
                        <span>Asce</span>
                        <input
                            type="radio"
                            name="sortDir"
                            value="1"
                            checked={filterByToEdit.sortDir === "1"}                        
                            onChange={handleChange}
                        />
                    </label>
                    <label className="tag" >
                        <span>Desc</span>
                        <input
                            type="radio"
                            name="sortDir"
                            value="-1"
                            onChange={handleChange}
                            checked={filterByToEdit.sortDir === "-1"}                        
                        />
                    </label>
                </div>

                <button onClick={resetSort}>Clear Sort</button>
            </div>

            <LabelChooser 
                labels={labels} 
                filterBy={filterByToEdit} 
                onSetFilterBy={setFilterByToEdit}/>
        </section>
    )
}