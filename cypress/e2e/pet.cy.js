describe('Verify Pet Functionality', () => {
  it('Add New Pet to Store', () => {
    cy.fixture('pet').then((pet) => {
      cy.request("POST", "/pet", pet)
        .should((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).property('id').to.eq(100);
          expect(response.body).property('name').to.eq("Maria");
        });
    })
  });

  it('Uploads an Image', () => {
    cy.fixture('shiba.jpg', 'binary').then(image => {
      const blob = Cypress.Blob.binaryStringToBlob(image, 'image/jpeg');
      const formData = new FormData();
      formData.append('file', blob, 'shiba.jpg')
      formData.append('additionalMetadata','test')
      cy.request({
        method: 'POST', 
        url: "/pet/100/uploadImage", 
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
          'accept': 'application/json'
        },
      })
      .should(response => {
        expect(response.status).to.eq(200)
        cy.log(JSON.stringify(response))
      })
    })
  })

  it('Find Pet by ID', () => {
    cy.fixture('pet').then((pet) => {
      cy.request("GET","/pet/"+pet.id)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).property('id').to.eq(100)
          expect(response.body).property('name').to.eq(pet.name)
          expect(response.body).property('status').to.eq("available")
        })
    })
  })

  it('Update a pet in the Store using Form Data', () => {
    cy.fixture('pet').then((pet) => {
      cy.request({
          method: "POST",
          url: "/pet/" + pet.id,
          form: true,
          body: {
            name: "Maria",
            status: "pending"
          }
        })
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).property('code').to.eq(200)
        })
      cy.request("GET","/pet/"+pet.id)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).property('id').to.eq(100)
          expect(response.body).property('status').to.eq("pending")
        })
    })
  })

  it('Update an existing pet', () => {
    cy.fixture('updated-pet').then((pet) => {
      cy.request('PUT','/pet',pet)
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).property('id').to.eq(100)
          expect(response.body).property('name').to.eq(pet.name)
          expect(response.body).property('status').to.eq("pending")
        })
    })
  })

  it('Finds Pets by tags', () => {
    cy.fixture('pet').then((pet) => {
      cy.request('GET','/pet/findByTags?tags=vaccinated')
        .should((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.be.an('Array')
          expect(response.body).to.have.length.of.at.least(1)
          expect(response.body[0]).to.have.property('id')
          expect(response.body[0]).property('id').to.eq(100)
        })
    })
  })

  it('Finds Pets by Status', () => {
    cy.request('GET','/pet/findByStatus?tags=available')
      .should((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('Array')
        expect(Cypress._.every(response.body,["status","available"])).to.deep.equal(true)
      })
  })

  it('Deletes a pet', () => {
    cy.fixture("pet").then(pet => {
      cy.request('DELETE',"/pet/"+pet.id)
        .should(response => {
          expect(response.status).to.eq(200)
          expect(response.body).property('code').to.eq(200)
        })
    })
  })
});
