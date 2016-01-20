using System;

namespace GDO.Apps.Spreadsheets.Models
{

    public abstract class Scenario
    {
        public Guid Id { get; set; }

        public Scenario()
        {
            this.Id = Guid.NewGuid();
        }

        public Scenario(Guid id)
        {
            this.Id = id;
        }

    }

}