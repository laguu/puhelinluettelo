import './index.css'
import React from 'react'
import axios from 'axios'
import personService from './services/persons'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      persons: [],
      newName: '',
      newNumber: '',
      filter: '',
      error: null,
      msg: null
    }
  }

  componentDidMount() {
    console.log('did mount')
    personService
      .getAll()
      .then(response => {
        console.log('promise fulfilled')
        this.setState({
          persons: response
        })
      })
      .catch(error => {
        this.setState({
          error: 'ei saatu tietoja palvelimelta'
        })
        setTimeout(() => {
          this.setState({ error: null })
        }, 5000)
      })
  }

  addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: this.state.newName,
      number: this.state.newNumber
    }

    let exists = false // tarkistetaan onko nimi jo olemassa
    let found_id = ''
    this.state.persons.forEach(p => {
      if (p.name === this.state.newName) {
        exists = true
        personObject.id = p.id
      }
    })

    if (exists) {

      if (window.confirm(personObject.name + ' on jo luetteossa, korvataanko vanha numero uudella?')) {

        // päivitä vanha tieto
        personService
          .update(personObject.id, personObject)
          .then(response => {
            const updatedPersons = this.state.persons.filter(p => p.id !== response.id)

            this.setState({
              persons: updatedPersons.concat(response),
              msg: 'Päivitettiin henkilön ' + personObject.name + " puhelinnumero."
            })
            setTimeout(() => {
              this.setState({ msg: null })
            }, 5000)
          })
          .catch(error => {
            this.setState({
              error: 'Ei voitu päivittää henkilön ' + personObject.name + " numeroa!"
            })
            setTimeout(() => {
              this.setState({ error: null })
            }, 5000)
          })
      } else return
    } else {

      personService // luo uusi tieto
        .create(personObject)
        .then(response => {
          this.setState({
            persons: this.state.persons.concat(response),
            newName: '',
            newNumber: '',
            msg: 'Lisättiin uusi henkilö: ' + personObject.name + "."
          })
          setTimeout(() => {
            this.setState({ msg: null })
          }, 5000)
        })
        .catch(error => {
          this.setState({
            error: 'ei voitu lisätä henkilöä ' + personObject.name
          })
          setTimeout(() => {
            this.setState({ error: null })
          }, 5000)
        })
    }

  }


  handleNameChange = (event) => {
    this.setState({ newName: event.target.value })
  }

  handleNumberChange = (event) => {
    this.setState({ newNumber: event.target.value })
  }

  handleFilterChange = (event) => {
    this.setState({ filter: event.target.value })
  }

  createDeleteHandler = (person) => {
    return () => {
      if (window.confirm('Poistetaanko ' + person.name)) {
        console.log('deleting', person.id)
        personService
          .remove(person.id)
          .then(response => {
            this.setState({
              persons: this.state.persons.filter(p => p.id !== person.id),
              msg: 'Poistettiin henkilö ' + person.name + "."
            })
            setTimeout(() => {
              this.setState({ msg: null })
            }, 5000)
            
          })
          .catch(error => {
            this.setState({
              error: 'ei voitu poistaa henkilöä ' + person.name
            })
            setTimeout(() => {
              this.setState({ error: null })
            }, 5000)
          })
      }
    }
  }

  shownPersons = (app) => {
    const persons = [...app.persons]
    return persons.filter(
      person => person.name
        .toLowerCase()
        .indexOf(this.state.filter.toLowerCase()) > -1)
  }

  render() {
    const persons = this.shownPersons(this.state)

    return (
      <div>
        <h2>Puhelinluettelo</h2>
        <Notification message={this.state.msg} type="message"/>
        <Notification message={this.state.error} type="error"/>
        <FilterForm filter={this.state.filter} handler={this.handleFilterChange} />
        <h2>Lisää uusi</h2>
        <AddPersonForm
          submitHandler={this.addPerson}
          field1={this.state.newName}
          field2={this.state.newNumber}
          handler1={this.handleNameChange}
          handler2={this.handleNumberChange}
        />
        <h2>Numerot</h2>
        <Numbers persons={persons} deleteHandler={this.createDeleteHandler.bind(this)} />
      </div >
    )
  }
}




// --- komponentit ---

const FilterForm = (props) => {
  return (
    <div>
      <p>rajaa näytettäviä <input value={props.filter} onChange={props.handler} /></p>
    </div>
  )
}

const AddPersonForm = (props) => {
  return (
    <div>
      <form onSubmit={props.submitHandler}>
        <p>nimi: <input value={props.field1} onChange={props.handler1} /></p>
        <p>numero: <input value={props.field2} onChange={props.handler2} /></p>
        <button type="submit">lisää</button>
      </form>
    </div>
  )
}

const Numbers = (props) => {
  console.log('draw persons now')
  return (
    <table>
      <tbody>
        {props.persons.map((person) => <Person person={person} key={person.id} deleteHandler={props.deleteHandler} />)}
      </tbody>
    </table>
  )
}

const Person = (props) => {
  return (
    <tr>
      <td>{props.person.name}</td>
      <td>{props.person.number}</td>
      <td><button onClick={props.deleteHandler(props.person)}>poista</button></td>
    </tr>
  )
}

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }
  return (
    <div className={type}>
      {message}
    </div>
  )
}


export default App
